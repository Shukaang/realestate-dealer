//api/admin/delete/route.ts
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { getAdminAuth, getAdminFirestore } = await import("@/lib/firebase-admin")
    const adminAuth = getAdminAuth()
    const adminFirestore = getAdminFirestore()

    const { adminId } = await req.json()
    if (!adminId) {
      return NextResponse.json({ error: "Admin ID is required" }, { status: 400 })
    }

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

    // Get target admin data
    const targetDoc = await adminFirestore.collection("admins").doc(adminId).get()
    if (!targetDoc.exists) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }
    const targetData = targetDoc.data()

    // Security checks
    if (targetData?.createdBy === "main admin") {
      return NextResponse.json({ error: "Cannot delete main admin" }, { status: 403 })
    }

    if (targetData?.role === "super-admin" && requesterData?.createdBy !== "main admin") {
      return NextResponse.json({ error: "Cannot delete super-admin" }, { status: 403 })
    }

    // Perform deletion
    await adminAuth.deleteUser(adminId)
    await adminFirestore.collection("admins").doc(adminId).delete()

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("Admin deletion failed:", error)
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    )
  }
}