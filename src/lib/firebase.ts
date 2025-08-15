// lib/firebase.ts
import { app } from "@/lib/init";
import { getAuth, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Initialize Firebase services using the app
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export only what's needed in your project
export { auth, db, storage };
export const logout = () => signOut(auth);
export const login = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);
export const signup = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);