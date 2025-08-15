//admin/(protected)/listings/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase/client";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/lib/context/AuthContext";
import ListingForm from "@/components/admin/listing-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";
import { getAuth, onAuthStateChanged } from "firebase/auth";

interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const { hasPermission, loading: authLoading, user, role } = useAuth();

  const [listingData, setListingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminName, setAdminName] = useState("");

  const id = params.id as string;
  const numericId = Number.parseInt(id);

  const { data: adminsData = [] } = useFirestoreCollection("admins");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && adminsData.length > 0) {
        const matchedAdmin = (adminsData as Admin[]).find(
          (admin) => admin.email === user.email
        );
        if (matchedAdmin) {
          setAdminName(`${matchedAdmin.firstName} ${matchedAdmin.lastName}`);
        }
      }
    });
    return () => unsubscribe();
  }, [adminsData]);

  useEffect(() => {
    async function fetchListing() {
      if (Number.isNaN(numericId)) {
        setError("Invalid listing ID");
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "listings"),
          where("numericId", "==", numericId)
        );
        const snap = await getDocs(q);

        console.log("📊 Query result - Documents found:", snap.size);

        if (snap.empty) {
          console.error("❌ No listing found with numericId:", numericId);
          setError("Listing not found");
          setLoading(false);
          return;
        }

        const docSnap = snap.docs[0];
        const rawData = docSnap.data();

        // Convert all Timestamps to ISO strings
        const data = {
          ...rawData,
          docId: docSnap.id,
          createdAt: rawData.createdAt?.toDate?.()?.toISOString(),
          updatedAt: rawData.updatedAt?.toDate?.()?.toISOString(),
          soldDate: rawData.soldDate?.toDate?.()?.toISOString() || null,
        };

        setListingData(data);
        setLoading(false);
      } catch (error) {
        console.error("❌ Failed to fetch listing:", error);
        setError("Failed to fetch listing");
        setLoading(false);
      }
    }

    fetchListing();
  }, [numericId]);

  // Show loading state while auth or data is loading
  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-64" />
            </div>
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error || !listingData) {
    return (
      <div className="container mx-auto py-16 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>
              {error || "Listing not found"}
              <br />
              <span className="font-mono text-sm">ID: {id}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/admin/listings")}
              className="gap-2 w-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Listings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has permission to edit listings
  if (!hasPermission("edit-listings")) {
    return (
      <div className="mx-auto py-16 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to edit listings. This action requires
              <strong className="">"edit-listings"</strong> permission.
            </CardDescription>
            {role && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Your current role:{" "}
                  <span className="font-medium capitalize">{role}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Contact your administrator to request access.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => router.push("/admin/listings")}
              className="gap-2 w-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Listings
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin")}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User has permission and data is loaded, show the edit form
  return (
    <div className="mx-auto p-6 space-y-6 bg-white dark:bg-gray-900 shadow">
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            Edit Listing: #{id}
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/listings")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Button>
      </div>

      <ListingForm initialData={listingData} />
      {/* User Info Footer */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>
              Editing as:{" "}
              <span className="font-medium text-blue-500">({adminName})</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>
              Role:{" "}
              <span className="font-medium capitalize text-red-500 px-2 py-1 border border-red-100 rounded-full bg-red-50 dark:bg-red-100">
                {role}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
