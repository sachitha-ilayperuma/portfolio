"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { fetchProfile } from "@/lib/firebase/profile"
import { fetchSectionVisibility } from "@/lib/firebase/sections"
import { checkFirebaseAvailability } from "@/lib/firebase/config"

interface Profile {
  name: string
  title: string
  bio: string
  location: string
  imageUrl: string
}

// Default profile data to use as fallback
const DEFAULT_PROFILE: Profile = {
  name: "John Doe",
  title: "Senior Software Engineer",
  bio: "Experienced software engineer with a passion for building innovative solutions.",
  location: "San Francisco, CA",
  imageUrl: "",
}

export function ProfileSection() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if Firebase is available
        const isFirebaseAvailable = checkFirebaseAvailability()

        if (!isFirebaseAvailable) {
          console.log("Firebase is not available. Using default profile data in component.")
          if (isMounted) {
            setProfile(DEFAULT_PROFILE)
            setIsVisible(true)
            setIsLoading(false)
          }
          return
        }

        // Fetch profile and visibility in parallel with error handling for each
        const profilePromise = fetchProfile().catch((err) => {
          console.error("Error fetching profile:", err)
          // Return default profile on error
          return DEFAULT_PROFILE
        })

        const visibilityPromise = fetchSectionVisibility("profile").catch((err) => {
          console.error("Error fetching section visibility:", err)
          // Default to visible on error
          return true
        })

        const [profileData, visibilityData] = await Promise.all([profilePromise, visibilityPromise])

        if (isMounted) {
          setProfile(profileData)
          setIsVisible(visibilityData)
        }
      } catch (err) {
        console.error("Error loading profile section:", err)
        if (isMounted) {
          // Use default data even if there's an error
          setProfile(DEFAULT_PROFILE)
          setError("Using default profile data due to connection issues.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return <div className="h-20 w-full animate-pulse rounded-lg bg-muted"></div>
  }

  if (!isVisible || !profile) {
    return null
  }

  return (
    <section id="about" className="py-12">
      <h2 className="mb-8 text-3xl font-bold">About Me</h2>
      {error && (
        <div className="mb-4 rounded-md bg-amber-50 p-4 text-amber-800">
          <p>{error}</p>
        </div>
      )}
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="grid gap-8 md:grid-cols-[200px_1fr]">
            <div className="flex justify-center md:justify-start">
              <div className="relative h-40 w-40 overflow-hidden rounded-full">
                <Image
                  src={profile.imageUrl || "/placeholder.svg?height=160&width=160"}
                  alt={profile.name}
                  width={160}
                  height={160}
                  className="object-cover"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold">{profile.name}</h3>
                <p className="text-muted-foreground">{profile.title}</p>
                <p className="text-sm text-muted-foreground">{profile.location}</p>
              </div>
              <div className="space-y-3">
                <p className="leading-relaxed">{profile.bio}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
