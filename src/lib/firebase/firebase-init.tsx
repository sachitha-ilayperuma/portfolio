"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { app, db } from "./config"
import { enableIndexedDbPersistence } from "firebase/firestore"

// Track if we've already tried to enable persistence
let persistenceEnabled = false

export function FirebaseInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Check if Firebase is initialized
        if (app) {
          // Try to enable persistence only once and only in the browser
          if (!persistenceEnabled && typeof window !== "undefined") {
            persistenceEnabled = true
            try {
              await enableIndexedDbPersistence(db)
              console.log("Firestore persistence enabled successfully")
            } catch (err: any) {
              // It's okay if this fails due to multiple tabs or after other Firestore operations
              if (err.code === "failed-precondition") {
                console.warn("Firestore persistence could not be enabled: Multiple tabs open")
              } else if (err.code === "unimplemented") {
                console.warn("Firestore persistence is not available in this environment")
              } else {
                console.warn("Firestore persistence error:", err)
              }
              // Continue even if persistence enabling fails
            }
          }
          setIsInitialized(true)
        }
      } catch (err) {
        console.error("Firebase initialization error:", err)
        setError(err instanceof Error ? err : new Error("Unknown Firebase initialization error"))
        // Still set as initialized so the app can continue with degraded functionality
        setIsInitialized(true)
      }
    }

    initializeFirebase()
  }, [])

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    console.warn("Firebase initialized with errors, continuing with limited functionality")
  }

  return <>{children}</>
}
