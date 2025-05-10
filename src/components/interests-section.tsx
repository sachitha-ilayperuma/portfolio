"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { fetchInterests } from "@/lib/firebase/interests"
import { fetchSectionVisibility } from "@/lib/firebase/sections"
import { checkFirebaseAvailability } from "@/lib/firebase/config"

interface Interest {
  id: string
  name: string
  description: string
  icon?: string
}

// Default interests data
const DEFAULT_INTERESTS = [
  {
    id: "1",
    name: "Open Source",
    description: "Contributing to open source projects and communities.",
    icon: "🌐",
  },
  {
    id: "2",
    name: "Machine Learning",
    description: "Exploring AI and machine learning applications.",
    icon: "🤖",
  },
  {
    id: "3",
    name: "Photography",
    description: "Capturing moments and landscapes through photography.",
    icon: "📷",
  },
]

export function InterestsSection() {
  const [interests, setInterests] = useState<Interest[]>([])
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
          console.log("Firebase is not available. Using default interests data in component.")
          if (isMounted) {
            setInterests(DEFAULT_INTERESTS)
            setIsVisible(true)
            setIsLoading(false)
          }
          return
        }

        // Fetch interests and visibility in parallel with error handling
        const interestsPromise = fetchInterests().catch((err) => {
          console.error("Error fetching interests:", err)
          return DEFAULT_INTERESTS
        })

        const visibilityPromise = fetchSectionVisibility("interests").catch((err) => {
          console.error("Error fetching section visibility:", err)
          return true
        })

        const [interestsData, visibilityData] = await Promise.all([interestsPromise, visibilityPromise])

        if (isMounted) {
          setInterests(interestsData)
          setIsVisible(visibilityData)
        }
      } catch (err) {
        console.error("Error loading interests section:", err)
        if (isMounted) {
          setInterests(DEFAULT_INTERESTS)
          setError("Using default interests data due to connection issues.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return <div className="h-60 w-full animate-pulse rounded-lg bg-muted"></div>
  }

  if (!isVisible) {
    return null
  }

  return (
    <section id="interests" className="py-12">
      <h2 className="mb-8 text-3xl font-bold">Interests</h2>
      {error && (
        <div className="mb-4 rounded-md bg-amber-50 p-4 text-amber-800">
          <p>{error}</p>
        </div>
      )}
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {interests.length > 0 ? (
              interests.map((interest) => (
                <div key={interest.id} className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-2xl">{interest.icon || "🔍"}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{interest.name}</h3>
                  <p className="text-sm text-muted-foreground">{interest.description}</p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-muted-foreground">No interests to display.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
