import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import ListingForm from "@/components/ListingForm";
import { notFound } from "next/navigation";

export default async function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const numericId = parseInt(params.id);
  if (isNaN(numericId)) return notFound();

  try {
    const q = query(
      collection(db, "listings"),
      where("numericId", "==", numericId)
    );

    const snap = await getDocs(q);
    if (snap.empty) return notFound();

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

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white dark:bg-gray-900 shadow rounded-2xl">
        <div className="flex gap-3">
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            Edit Listing: #{params.id}
          </h1>
        </div>
        <ListingForm initialData={data} />
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch listing:", error);
    return notFound();
  }
}
