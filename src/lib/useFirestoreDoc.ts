"use client"

import { useEffect, useState } from "react"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

export function useFirestoreCollection<T>(collectionName: string) {
  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const q = query(collection(db, collectionName))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[]
        setData(items)
        setIsLoading(false)
        setError(null)
      },
      (err) => {
        console.error(`Error fetching ${collectionName}:, err`)
        setError(err as Error)
        setIsLoading(false)
      },
    )

    return () => unsubscribe()
  }, [collectionName])

  const mutate = (updater: (prev: T[]) => T[]) => {
    setData(updater)
  }

  return { data, isLoading, error, mutate }
}