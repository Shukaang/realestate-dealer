// app/api/auth/decode/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    const adminDoc = await adminFirestore.collection("admins").doc(decoded.uid).get();
    const role = adminDoc.exists ? adminDoc.data()?.role : null;

    return NextResponse.json({ uid: decoded.uid, role });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}