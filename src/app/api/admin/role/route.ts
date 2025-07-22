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
          details: importError instanceof Error ? importError.message : String(importError)
        },
        { status: 500 }
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

    // Verify requester is super-admin
    const requesterDoc = await adminFirestore.collection("admins").doc(decodedToken.uid).get()

    if (!requesterDoc.exists || requesterDoc.data()?.role !== "super-admin") {
      
      return NextResponse.json({ error: "Forbidden - Super admin access required" }, { status: 403 })
    }

    // Parse and validate request
    let requestData
    try {
      requestData = await req.json()
     
    } catch (parseError) {
     
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { adminId, newRole } = requestData
    const validRoles = ["super-admin", "admin", "moderator", "viewer"]

    if (!adminId || !newRole) {
      return NextResponse.json({ error: "Both adminId and newRole are required" }, { status: 400 })
    }

    if (!validRoles.includes(newRole)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` }, { status: 400 })
    }

    // Prevent self-demotion from super-admin
    if (decodedToken.uid === adminId && newRole !== "super-admin") {
      return NextResponse.json({ error: "Cannot remove your own super-admin status" }, { status: 403 })
    }

    // Check if admin exists
    const adminDoc = await adminFirestore.collection("admins").doc(adminId).get()
    if (!adminDoc.exists) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    const currentAdminData = adminDoc.data()
    const oldRole = currentAdminData?.role

   
    // Update role
    try {
      await adminFirestore.collection("admins").doc(adminId).update({
        role: newRole,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: decodedToken.uid,
        previousRole: oldRole, // Keep track of previous role
      })

      console.log("Role updated successfully")
    } catch (updateError: any) {
      console.error("Role update failed:", updateError)
      let errorMessage = "Failed to update role"
      if (updateError.code === "permission-denied") {
        errorMessage = "Permission denied - check Firestore security rules"
      } else if (updateError.code === "not-found") {
        errorMessage = "Admin document not found"
      }

      return NextResponse.json({ 
        error: errorMessage,
        details: updateError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Role updated successfully",
      updatedAdmin: {
        id: adminId,
        email: currentAdminData?.email,
        oldRole,
        newRole
      }
    })

  } catch (error: any) {
    console.error("Unexpected error in role update:", error)
    return NextResponse.json({ 
      error: "Internal server error. Please try again later.",
      details: error.message 
    }, { status: 500 })
  }
}

// Add GET method for testing
export async function GET() {
  try {
    console.log("Testing Firebase Admin import...")
    const { getFirebaseAdmin } = await import("@/lib/firebase-admin")
    getFirebaseAdmin()
    return NextResponse.json({ message: "Admin role endpoint is working - Firebase Admin OK" })
  } catch (error) {
    console.error("Firebase Admin test failed:", error)
    return NextResponse.json({ 
      message: "Admin role endpoint loaded but Firebase Admin failed",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}