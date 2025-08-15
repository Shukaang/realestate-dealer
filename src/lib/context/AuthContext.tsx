//lib/context/AuthContext.tsx

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import {
  auth,
  db,
  getIdToken as getFirebaseIdToken,
} from "@/lib/firebase/client";

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const rolePermissions = {
  "super-admin": [
    "view-dashboard",
    "manage-admins",
    "view-listings",
    "edit-listings",
    "delete-listings",
    "view-appointments",
    "manage-appointments",
    "upload-content",
    "view-messages",
    "manage-messages",
  ],
  admin: [
    "view-listings",
    "edit-listings",
    "view-appointments",
    "manage-appointments",
    "upload-content",
    "view-messages",
    "manage-messages",
  ],
  moderator: [
    "view-listings",
    "edit-listings",
    "view-appointments",
    "manage-appointments",
    "view-messages",
  ],
  viewer: ["view-listings", "view-appointments", "view-messages"],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);

      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      // Listen to user's admin document for role changes
      const adminDocRef = doc(db, "admins", user.uid);
      const unsubscribeDoc = onSnapshot(
        adminDocRef,
        (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            setRole(userData.role);
          } else {
            setRole(null);
          }
          setLoading(false);
        },
        (error) => {
          setRole(null);
          setLoading(false);
        }
      );

      return () => unsubscribeDoc();
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setRole(null);
    } catch (error) {
      throw error;
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!role) {
      return false;
    }

    const permissions = rolePermissions[role as keyof typeof rolePermissions];
    const hasAccess = permissions?.includes(permission) || false;

    return hasAccess;
  };

  const getIdToken = async (forceRefresh = false): Promise<string | null> => {
    try {
      const token = await getFirebaseIdToken(forceRefresh);
      if (!token) {
      }
      return token;
    } catch (error) {
      return null;
    }
  };

  const value = {
    user,
    role,
    loading,
    signOut,
    hasPermission,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
