"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchExperiences } from "@/lib/firebase/experiences"
import { fetchSectionVisibility } from "@/lib/firebase/sections"
import { checkFirebaseAvailability } from "@/lib/firebase/config"

interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string | null
  description: string
  location: string
}

// Default experiences data
const DEFAULT_EXPERIENCES: Experience[] = [
  {
    id: "1",
    company: "Tech Innovators",
    position: "Senior Software Engineer",
    startDate: "2020-01-01",
    endDate: null,
    description: "Leading development of cloud-based solutions using React, Node.js, and AWS.",
    location: "San Francisco, CA",
  },
  {
    id: "2",
    company: "Digital Solutions Inc.",
    position: "Software Engineer",
    startDate: "2017-03-15",
    endDate: "2019-12-31",
    description: "Developed and maintained web applications using React and Express.",
    location: "Seattle, WA",
  },
]

export function ExperienceSection() {
  const [experiences, setExperiences] = useState<Experience[]>([])
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
          console.log("Firebase is not available. Using default experiences data in component.")
          if (isMounted) {
            setExperiences(DEFAULT_EXPERIENCES)
            setIsVisible(true)
            setIsLoading(false)
          }
          return
        }

        // Fetch experiences and visibility in parallel with error handling
        const experiencesPromise = fetchExperiences().catch((err) => {
          console.error("Error fetching experiences:", err)
          return DEFAULT_EXPERIENCES
        })

        const visibilityPromise = fetchSectionVisibility("experience").catch((err) => {
          console.error("Error fetching section visibility:", err)
          return true
        })

        const [experiencesData, visibilityData] = await Promise.all([experiencesPromise, visibilityPromise])

        // Sort by date (most recent first)
        const sortedExperiences = experiencesData.sort((a, b) => {
          const dateA = a.endDate || new Date().toISOString()
          const dateB = b.endDate || new Date().toISOString()
          return new Date(dateB).getTime() - new Date(dateA).getTime()
        })

        if (isMounted) {
          setExperiences(sortedExperiences)
          setIsVisible(visibilityData)
        }
      } catch (err) {
        console.error("Error loading experience section:", err)
        if (isMounted) {
          setExperiences(DEFAULT_EXPERIENCES)
          setError("Using default experiences data due to connection issues.")
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
    <section id="experience" className="py-12">
      <h2 className="mb-8 text-3xl font-bold">Work Experience</h2>
      {error && (
        <div className="mb-4 rounded-md bg-amber-50 p-4 text-amber-800">
          <p>{error}</p>
        </div>
      )}
      <div className="space-y-6">
        {experiences.map((experience) => {
          const startDate = new Date(experience.startDate)
          const endDate = experience.endDate ? new Date(experience.endDate) : null

          const formattedStartDate = startDate.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })

          const formattedEndDate = endDate
            ? endDate.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })
            : "Present"

          return (
            <Card key={experience.id}>
              <CardHeader>
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <CardTitle>{experience.position}</CardTitle>
                    <CardDescription className="text-base">
                      {experience.company} • {experience.location}
                    </CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formattedStartDate} - {formattedEndDate}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{experience.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
