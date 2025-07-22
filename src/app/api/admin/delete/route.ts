import { NextRequest, NextResponse } from "next/server"


export async function POST(req: NextRequest) {
  
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

    // Parse request body
    let requestData
    try {
      requestData = await req.json()
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { adminId } = requestData

    if (!adminId) {
      return NextResponse.json({ error: "Admin ID is required" }, { status: 400 })
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

    // Get requester's role from Firestore
    const requesterDoc = await adminFirestore.collection("admins").doc(decodedToken.uid).get()

    if (!requesterDoc.exists || requesterDoc.data()?.role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden - Super admin access required" }, { status: 403 })
    }

    // Prevent self-deletion
    if (decodedToken.uid === adminId) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 403 })
    }

    // Check if admin exists before deletion
    const adminDoc = await adminFirestore.collection("admins").doc(adminId).get()
    if (!adminDoc.exists) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    const adminData = adminDoc.data()

    // Perform atomic deletion operations
    try {
      await Promise.all([
        adminAuth.deleteUser(adminId),
        adminFirestore.collection("admins").doc(adminId).delete()
      ])
    } catch (deletionError: any) {
      console.error("Deletion failed:", deletionError)

      if (deletionError.code === "auth/user-not-found") {
        // User might not exist in Auth, but we should still delete from Firestore
        await adminFirestore.collection("admins").doc(adminId).delete()
        console.log("Deleted admin from Firestore only (user not found in Auth)")
      } else {
        return NextResponse.json({ 
          error: "Failed to delete admin",
          details: deletionError.message 
        }, { status: 500 })
      }
    }
    return NextResponse.json({ 
      success: true, 
      message: "Admin deleted successfully",
      deletedAdmin: {
        id: adminId,
        email: adminData?.email
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error("Unexpected error in admin deletion:", error)
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
    return NextResponse.json({ message: "Admin delete endpoint is working - Firebase Admin OK" })
  } catch (error) {
    console.error("Firebase Admin test failed:", error)
    return NextResponse.json({ 
      message: "Admin delete endpoint loaded but Firebase Admin failed",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}