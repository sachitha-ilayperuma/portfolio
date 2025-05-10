"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { fetchInterests } from "@/lib/firebase/interests"
import { fetchSectionVisibility } from "@/lib/firebase/sections"

interface Interest {
  id: string
  name: string
  description: string
  icon?: string
}

export function InterestsSection() {
  const [interests, setInterests] = useState<Interest[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [interestsData, visibilityData] = await Promise.all([
          fetchInterests(),
          fetchSectionVisibility("interests"),
        ])

        setInterests(interestsData)
        setIsVisible(visibilityData)
      } catch (error) {
        console.error("Error loading interests section:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return <div className="h-40 w-full animate-pulse rounded-lg bg-muted"></div>
  }

  if (!isVisible) {
    return null
  }

  return (
    <section id="interests" className="py-12">
      <h2 className="mb-8 text-3xl font-bold">Interests</h2>
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {interests.map((interest) => (
              <div key={interest.id} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  {/* You can use a dynamic icon here based on interest.icon */}
                  <span className="text-2xl">{interest.icon || "🔍"}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{interest.name}</h3>
                <p className="text-sm text-muted-foreground">{interest.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
