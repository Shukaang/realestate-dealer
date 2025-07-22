import { cert, initializeApp, getApps, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"
import { getFirestore, type Firestore, type FieldValue, type Timestamp } from "firebase-admin/firestore"

// Type for admin user
export interface AdminUser {
  uid: string
  email: string
  firstName: string
  lastName: string
  role: AdminRole
  createdAt?: Timestamp | FieldValue
  createdBy?: string
}

export type AdminRole = "super-admin" | "admin" | "moderator" | "viewer"

let adminApp: App | null = null
let adminAuth: Auth | null = null
let adminFirestore: Firestore | null = null

// Initialize Firebase Admin only on server-side
function initializeFirebaseAdmin() {
  if (typeof window !== "undefined") {
    throw new Error("Firebase Admin SDK should only be used on the server-side")
  }

  if (adminApp && adminAuth && adminFirestore) {
    return { adminApp, adminAuth, adminFirestore }
  }

  try {

    // Check if already initialized
    if (getApps().length > 0) {
      adminApp = getApps()[0]
      adminAuth = getAuth(adminApp)
      adminFirestore = getFirestore(adminApp)
      return { adminApp, adminAuth, adminFirestore }
    }

    // Use environment variables instead of file
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing Firebase Admin environment variables. Please check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY")
    }

    

    // Initialize Firebase Admin with environment variables
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
      }),
      databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
    })

    adminAuth = getAuth(adminApp)
    adminFirestore = getFirestore(adminApp)

    // Configure Firestore
    adminFirestore.settings({ ignoreUndefinedProperties: true })

    return { adminApp, adminAuth, adminFirestore }

  } catch (error) {
    throw error
  }
}

// Helper functions
export async function isSuperAdmin(uid: string): Promise<boolean> {
  if (typeof window !== "undefined") {
    throw new Error("isSuperAdmin can only be called on the server-side")
  }

  try {
    const { adminFirestore } = initializeFirebaseAdmin()
    const doc = await adminFirestore.collection("admins").doc(uid).get()
    return doc.exists && doc.data()?.role === "super-admin"
  } catch (error) {
    console.error("Error checking super admin status:", error)
    return false
  }
}

export async function getAdminRole(uid: string): Promise<AdminRole | null> {
  if (typeof window !== "undefined") {
    throw new Error("getAdminRole can only be called on the server-side")
  }

  try {
    const { adminFirestore } = initializeFirebaseAdmin()
    const doc = await adminFirestore.collection("admins").doc(uid).get()
    return doc.exists ? doc.data()?.role || null : null
  } catch (error) {
    console.error("Error getting admin role:", error)
    return null
  }
}

// Export function to get initialized instances
export function getFirebaseAdmin() {
  if (typeof window !== "undefined") {
    throw new Error("Firebase Admin SDK should only be used on the server-side")
  }
  return initializeFirebaseAdmin()
}

// For backward compatibility
export const getAdminAuth = () => {
  const { adminAuth } = getFirebaseAdmin()
  return adminAuth
}
export const getAdminFirestore = () => {
  const { adminFirestore } = getFirebaseAdmin()
  return adminFirestore
}