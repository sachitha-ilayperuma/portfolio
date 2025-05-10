"use client"

import { useContext } from "react"
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth"
import { auth, checkFirebaseAvailability } from "@/lib/firebase/config"
import { AuthContext } from "@/lib/auth-provider"

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  const signIn = async (email: string, password: string) => {
    if (!checkFirebaseAvailability()) {
      throw new Error("Firebase is not available. Cannot sign in.")
    }
    return signInWithEmailAndPassword(auth, email, password)
  }

  const signOut = async () => {
    if (!checkFirebaseAvailability()) {
      throw new Error("Firebase is not available. Cannot sign out.")
    }
    return firebaseSignOut(auth)
  }

  return {
    user: context.user,
    loading: context.loading,
    isFirebaseAvailable: context.isFirebaseAvailable,
    signIn,
    signOut,
  }
}
