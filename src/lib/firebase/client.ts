import { initializeApp, getApps } from "firebase/app"
import { getAuth, getIdToken as firebaseGetIdToken } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Client-side Firebase initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Enhanced getIdToken function with better error handling
export const getIdToken = async (forceRefresh = false): Promise<string | null> => {
  try {
    const user = auth.currentUser
    if (!user) {
      return null
    }

    const token = await firebaseGetIdToken(user, forceRefresh)
    return token
  } catch (error) {
    console.error("Error getting ID token:", error)
    return null
  }
}

export { app, auth, db, storage }