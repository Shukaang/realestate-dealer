import { NextResponse } from "next/server"
import { FieldValue } from "firebase-admin/firestore"

export async function POST(req: Request) {
  try {
    // Import and initialize Firebase Admin
    let adminAuth, adminFirestore

    try {
      const { getFirebaseAdmin } = await import("@/lib/firebase-admin")
      const firebaseAdmin = getFirebaseAdmin()
      adminAuth = firebaseAdmin.adminAuth
      adminFirestore = firebaseAdmin.adminFirestore
    } catch (importError) {
      return NextResponse.json(
        {
          error: "Server configuration error - Firebase Admin not available",
          details: importError instanceof Error ? importError.message : String(importError),
        },
        { status: 500 },
      )
    }

    // Authorization check
    const authHeader = req.headers.get("Authorization")

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized - Missing token" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    let decodedToken

    try {
      decodedToken = await adminAuth.verifyIdToken(token)
    } catch (tokenError) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
    }

    // Verify requester is super-admin AND get their profile info
    const requesterDoc = await adminFirestore.collection("admins").doc(decodedToken.uid).get()

    if (!requesterDoc.exists || requesterDoc.data()?.role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden - Super admin access required" }, { status: 403 })
    }

    // Get the requester's profile data for createdBy field
    const requesterData = requesterDoc.data()
    const creatorName =
      `${requesterData?.firstName || ""} ${requesterData?.lastName || ""}`.trim() ||
      requesterData?.email ||
      decodedToken.uid

    // Parse and validate request
    let requestData
    try {
      requestData = await req.json()
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { email, password, firstName, lastName, role } = requestData
    const validRoles = ["super-admin", "admin", "moderator", "viewer"]

    // Validation
    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, password and role are required" }, { status: 400 })
    }

    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 })
    }

    // Create user in Firebase Auth
    let userRecord
    try {
      userRecord = await adminAuth.createUser({
        email: email.trim().toLowerCase(),
        password,
        emailVerified: false,
      })
    } catch (authError: any) {
      let errorMessage = "Failed to create user account"
      if (authError.code === "auth/email-already-exists") {
        errorMessage = "An account with this email already exists"
      } else if (authError.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format"
      } else if (authError.code === "auth/weak-password") {
        errorMessage = "Password is too weak"
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    // Create admin document in Firestore
    const adminData = {
      uid: userRecord.uid,
      email: email.trim().toLowerCase(),
      firstName: firstName?.trim() || "",
      lastName: lastName?.trim() || "",
      role,
      createdBy: creatorName, // Now contains the creator's full name
      createdById: decodedToken.uid, // Keep the UID for reference
      createdAt: FieldValue.serverTimestamp(),
    }
    try {
      await adminFirestore.collection("admins").doc(userRecord.uid).set(adminData)
    } catch (firestoreError) {
      // Cleanup: delete the auth user if Firestore fails
      try {
        await adminAuth.deleteUser(userRecord.uid)
      } catch (cleanupError) {
        // Log cleanup error but don't throw
      }

      return NextResponse.json({ error: "Failed to create admin profile. Please try again." }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        uid: userRecord.uid,
        message: "Admin created successfully",
        createdBy: creatorName, // Include in response for confirmation
      },
      { status: 201 },
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Internal server error. Please try again later.",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// Add GET method for testing
export async function GET() {
  try {
    const { getFirebaseAdmin } = await import("@/lib/firebase-admin")
    getFirebaseAdmin()
    return NextResponse.json({ message: "Admin create endpoint is working - Firebase Admin OK" })
  } catch (error) {
    return NextResponse.json(
      {
        message: "Admin create endpoint loaded but Firebase Admin failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}