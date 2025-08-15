//api/admin/create/route.ts
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  console.log("🚀 === ADMIN CREATION STARTED ===");

  try {
    // Import and initialize Firebase Admin
    let adminAuth, adminFirestore;
    try {
      const { getFirebaseAdmin } = await import("@/lib/firebase-admin");
      const firebaseAdmin = getFirebaseAdmin();
      adminAuth = firebaseAdmin.adminAuth;
      adminFirestore = firebaseAdmin.adminFirestore;
      console.log("✅ Firebase Admin initialized successfully");
    } catch (importError) {
      console.error("❌ Firebase Admin import error:", importError);
      return NextResponse.json(
        {
          error: "Server configuration error - Firebase Admin not available",
          details:
            importError instanceof Error
              ? importError.message
              : String(importError),
        },
        { status: 500 }
      );
    }

    // Authorization check
    const authHeader = req.headers.get("Authorization");
    console.log("🔑 Auth header present:", !!authHeader);

    if (!authHeader?.startsWith("Bearer ")) {
      console.log("❌ Missing or invalid authorization header");
      return NextResponse.json(
        { error: "Unauthorized - Missing token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    console.log("🔑 Token extracted, length:", token?.length);

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
      console.log("✅ Token verified for user:", decodedToken.uid);
    } catch (tokenError: any) {
      console.error("❌ Token verification error:", tokenError);
      console.error("❌ Token error code:", tokenError.code);
      console.error("❌ Token error message:", tokenError.message);
      return NextResponse.json(
        {
          error: "Invalid authentication token",
          details: tokenError.message,
        },
        { status: 401 }
      );
    }

    // Verify requester is super-admin AND get their profile info
    console.log("🔍 Checking requester permissions...");
    const requesterDoc = await adminFirestore
      .collection("admins")
      .doc(decodedToken.uid)
      .get();

    if (!requesterDoc.exists) {
      console.log("❌ Requester document not found:", decodedToken.uid);
      return NextResponse.json(
        { error: "Admin profile not found" },
        { status: 403 }
      );
    }

    const requesterData = requesterDoc.data();
    console.log("👤 Requester role:", requesterData?.role);

    if (requesterData?.role !== "super-admin") {
      console.log("❌ User is not super-admin:", decodedToken.uid);
      return NextResponse.json(
        { error: "Forbidden - Super admin access required" },
        { status: 403 }
      );
    }
    console.log("✅ Super-admin access verified");

    // Get the requester's profile data for createdBy field
    const creatorName =
      `${requesterData?.firstName || ""} ${
        requesterData?.lastName || ""
      }`.trim() ||
      requesterData?.email ||
      decodedToken.uid;

    // Parse and validate request
    let requestData;
    try {
      requestData = await req.json();
      console.log("📝 Request data received:", {
        ...requestData,
        password: "[HIDDEN]",
      });
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, role } = requestData;
    const validRoles = ["super-admin", "admin", "moderator", "viewer"];

    // Validation
    if (!email || !password || !role) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        { error: "Email, password and role are required" },
        { status: 400 }
      );
    }

    if (!validRoles.includes(role)) {
      console.log("❌ Invalid role:", role);
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // SECURITY: Prevent non-main admin from creating super-admins
    if (role === "super-admin" && requesterData?.createdBy !== "main admin") {
      console.log("❌ Unauthorized super-admin creation attempt");
      return NextResponse.json(
        { error: "Only main admin can create super-admins" },
        { status: 403 }
      );
    }

    // SECURITY: Prevent super-admins from creating other super-admins
    if (
      role === "super-admin" &&
      requesterData?.role === "super-admin" &&
      requesterData?.createdBy !== "main admin"
    ) {
      console.log("❌ Super-admin attempted to create another super-admin");
      return NextResponse.json(
        { error: "Super-admins cannot create other super-admins" },
        { status: 403 }
      );
    }

    if (password.length < 6) {
      console.log("❌ Password too short");
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ Invalid email format");
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Create user in Firebase Auth
    let userRecord;
    try {
      console.log("👤 Creating user in Firebase Auth...");
      userRecord = await adminAuth.createUser({
        email: email.trim().toLowerCase(),
        password,
        emailVerified: false,
      });
      console.log("✅ User created in Firebase Auth:", userRecord.uid);
    } catch (authError: any) {
      console.error("❌ Auth user creation error:", authError);
      let errorMessage = "Failed to create user account";
      if (authError.code === "auth/email-already-exists") {
        errorMessage = "An account with this email already exists";
      } else if (authError.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format";
      } else if (authError.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      }
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Create admin document in Firestore
    const adminData = {
      uid: userRecord.uid,
      email: email.trim().toLowerCase(),
      firstName: firstName?.trim() || "",
      lastName: lastName?.trim() || "",
      role,
      createdBy: creatorName,
      createdById: decodedToken.uid, // Track who created this admin
      createdAt: FieldValue.serverTimestamp(),
    };

    try {
      console.log("📄 Creating admin document in Firestore...");
      await adminFirestore
        .collection("admins")
        .doc(userRecord.uid)
        .set(adminData);
      console.log("✅ Admin document created in Firestore");
    } catch (firestoreError) {
      console.error("❌ Firestore document creation error:", firestoreError);
      // Cleanup: delete the auth user if Firestore fails
      try {
        await adminAuth.deleteUser(userRecord.uid);
        console.log("🧹 Cleaned up auth user after Firestore failure");
      } catch (cleanupError) {
        console.error("❌ Cleanup error:", cleanupError);
      }
      return NextResponse.json(
        { error: "Failed to create admin profile. Please try again." },
        { status: 500 }
      );
    }

    console.log("🎉 === ADMIN CREATION COMPLETED SUCCESSFULLY ===");
    return NextResponse.json(
      {
        success: true,
        uid: userRecord.uid,
        message: "Admin created successfully",
        createdBy: creatorName,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Unexpected error in admin creation:", error);
    return NextResponse.json(
      {
        error: "Internal server error. Please try again later.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Add GET method for testing
export async function GET() {
  try {
    console.log("🧪 Testing Firebase Admin import...");
    const { getFirebaseAdmin } = await import("@/lib/firebase-admin");
    getFirebaseAdmin();
    return NextResponse.json({
      message: "Admin create endpoint is working - Firebase Admin OK",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Firebase Admin test failed:", error);
    return NextResponse.json(
      {
        message: "Admin create endpoint loaded but Firebase Admin failed",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
