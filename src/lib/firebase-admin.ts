// lib/firebase-admin.ts
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
    console.log("🔄 Using existing Firebase Admin instance")
    return { adminApp, adminAuth, adminFirestore }
  }

  try {
    // Check if already initialized
    if (getApps().length > 0) {
      console.log("🔄 Using existing Firebase app")
      adminApp = getApps()[0]
      adminAuth = getAuth(adminApp)
      adminFirestore = getFirestore(adminApp)
      return { adminApp, adminAuth, adminFirestore }
    }

    console.log("🚀 Initializing Firebase Admin...")

    // Use environment variables with proper validation
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY

    console.log("🔍 Environment variables check:")
    console.log("- PROJECT_ID:", projectId)
    console.log("- CLIENT_EMAIL:", clientEmail)
    console.log("- PRIVATE_KEY length:", privateKey?.length)

    if (!projectId || !clientEmail || !privateKey) {
      console.error("❌ Missing Firebase Admin environment variables:")
      console.error("- FIREBASE_PROJECT_ID:", !!projectId)
      console.error("- FIREBASE_CLIENT_EMAIL:", !!clientEmail)
      console.error("- FIREBASE_PRIVATE_KEY:", !!privateKey)
      throw new Error("Missing Firebase Admin environment variables")
    }

    // Clean up the private key - handle both quoted and unquoted formats
    let cleanPrivateKey = privateKey

    // Remove outer quotes if present
    if (cleanPrivateKey.startsWith('"') && cleanPrivateKey.endsWith('"')) {
      cleanPrivateKey = cleanPrivateKey.slice(1, -1)
    }

    // Replace escaped newlines with actual newlines
    cleanPrivateKey = cleanPrivateKey.replace(/\\n/g, "\n")

    console.log("🔑 Private key starts with:", cleanPrivateKey.substring(0, 30))
    console.log("🔑 Private key ends with:", cleanPrivateKey.substring(cleanPrivateKey.length - 30))
    console.log("🔑 Private key contains BEGIN:", cleanPrivateKey.includes("-----BEGIN PRIVATE KEY-----"))
    console.log("🔑 Private key contains END:", cleanPrivateKey.includes("-----END PRIVATE KEY-----"))

    // Validate private key format
    if (
      !cleanPrivateKey.includes("-----BEGIN PRIVATE KEY-----") ||
      !cleanPrivateKey.includes("-----END PRIVATE KEY-----")
    ) {
      throw new Error("Private key does not contain proper PEM headers")
    }

    // Create the service account object
    const serviceAccount = {
      type: "service_account",
      project_id: projectId,
      private_key_id: "fac9baa80d8aaf10b2151f06afcd1e55d0970959",
      private_key: cleanPrivateKey,
      client_email: clientEmail,
      client_id: "106710276424550390931",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`,
      universe_domain: "googleapis.com",
    }

    console.log("🔧 Service account object created")

    // Initialize Firebase Admin
    adminApp = initializeApp({
      credential: cert(serviceAccount as any),
      projectId: projectId,
    })

    adminAuth = getAuth(adminApp)
    adminFirestore = getFirestore(adminApp)

    // Configure Firestore
    adminFirestore.settings({ ignoreUndefinedProperties: true })

    console.log("✅ Firebase Admin initialized successfully")
    console.log("✅ Project ID:", adminApp.options.projectId)
    console.log("✅ Service Account Email:", serviceAccount.client_email)

    return { adminApp, adminAuth, adminFirestore }
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error)
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
export { getAdminAuth as adminAuth, getAdminFirestore as adminFirestore };