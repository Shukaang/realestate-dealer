//api/admin/update-role/route.ts
import { NextResponse } from "next/server"
import { FieldValue } from "firebase-admin/firestore"

export async function POST(req: Request) {
  try {
    const { getAdminAuth, getAdminFirestore } = await import("@/lib/firebase-admin")
    const adminAuth = getAdminAuth()
    const adminFirestore = getAdminFirestore()

    // Authorization
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decodedToken = await adminAuth.verifyIdToken(token)

    // Get requester data
    const requesterDoc = await adminFirestore.collection("admins").doc(decodedToken.uid).get()
    if (!requesterDoc.exists) {
      return NextResponse.json({ error: "Admin profile not found" }, { status: 403 })
    }
    const requesterData = requesterDoc.data()

    // Parse request
    const { adminId, newRole } = await req.json()
    const validRoles = ["super-admin", "admin", "moderator", "viewer"]
    
    if (!adminId || !newRole || !validRoles.includes(newRole)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Get target admin data
    const targetDoc = await adminFirestore.collection("admins").doc(adminId).get()
    if (!targetDoc.exists) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }
    const targetData = targetDoc.data()

    // Security checks
    if (targetData?.createdBy === "main admin") {
      return NextResponse.json({ error: "Cannot modify main admin" }, { status: 403 })
    }

    if (targetData?.role === "super-admin" && requesterData?.createdBy !== "main admin") {
      return NextResponse.json({ error: "Cannot modify super-admin" }, { status: 403 })
    }

    if (newRole === "super-admin" && requesterData?.createdBy !== "main admin") {
      return NextResponse.json({ error: "Cannot create super-admin" }, { status: 403 })
    }

    // Update role
    await adminFirestore.collection("admins").doc(adminId).update({
      role: newRole,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: decodedToken.uid
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("Role update failed:", error)
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    )
  }
}