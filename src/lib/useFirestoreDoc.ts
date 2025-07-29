"use client"

import { useEffect, useState } from "react"
import { collection, onSnapshot, query } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

// Shared in-memory cache
const firestoreCache: Record<string, any[]> = {}
const listeners: Record<string, () => void> = {}

type CacheCallback<T> = (data: T[]) => void
const subscribers: Record<string, Set<CacheCallback<any>>> = {}

export function useFirestoreCollection<T>(collectionName: string) {
  const [data, setData] = useState<T[]>(firestoreCache[collectionName] || [])
  const [isLoading, setIsLoading] = useState(!firestoreCache[collectionName])
  const [error, setError] = useState<Error | null>(null)

  // Set up subscriber
  useEffect(() => {
    const callback: CacheCallback<T> = (newData) => {
      setData(newData)
      setIsLoading(false)
    }

    if (!subscribers[collectionName]) {
      subscribers[collectionName] = new Set()
    }
    subscribers[collectionName].add(callback)

    // If no listener yet, set one up
    if (!listeners[collectionName]) {
      const q = query(collection(db, collectionName))
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[]
          firestoreCache[collectionName] = items
          subscribers[collectionName].forEach((cb) => cb(items))
        },
        (err) => {
          console.error(`Error fetching ${collectionName}:, err`)
          setError(err as Error)
          setIsLoading(false)
        },
      )
      listeners[collectionName] = unsubscribe
    }

    return () => {
      // Remove subscriber
      subscribers[collectionName].delete(callback)
      // Optionally clear listener when no one is listening
      if (subscribers[collectionName].size === 0 && listeners[collectionName]) {
        listeners[collectionName]()
        delete listeners[collectionName]
        delete firestoreCache[collectionName]
      }
    }
  }, [collectionName])

  const mutate = (updater: (prev: T[]) => T[]) => {
    const updated = updater(firestoreCache[collectionName] || [])
    firestoreCache[collectionName] = updated
    subscribers[collectionName]?.forEach((cb) => cb(updated))
  }

  return { data, isLoading, error, mutate }
}