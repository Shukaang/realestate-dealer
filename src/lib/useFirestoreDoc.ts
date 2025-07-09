import useSWR from "swr";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const fetchCollection = async <T>(collectionName: string): Promise<T[]> => {
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
};

export const useFirestoreCollection = <T>(collectionName: string) => {
  const { data, error, isLoading, mutate } = useSWR(collectionName, () =>
    fetchCollection<T>(collectionName)
  );

  return {
    data: data || [],
    error,
    isLoading,
    mutate,
  };
};