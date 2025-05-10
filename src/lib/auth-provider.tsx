"use client"

import type React from "react"

import { createContext, useEffect, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth, checkFirebaseAvailability } from "@/lib/firebase/config"

interface AuthContextType {
  user: User | null
  loading: boolean
  isFirebaseAvailable: boolean
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isFirebaseAvailable: false,
})

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const isFirebaseAvailable = checkFirebaseAvailability()

  useEffect(() => {
    // Only set up auth listener if Firebase is available
    if (!isFirebaseAvailable) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [isFirebaseAvailable])

  return <AuthContext.Provider value={{ user, loading, isFirebaseAvailable }}>{children}</AuthContext.Provider>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthContextProvider>{children}</AuthContextProvider>
}
