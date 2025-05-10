"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchEducation } from "@/lib/firebase/education"
import { fetchSectionVisibility } from "@/lib/firebase/sections"
import { checkFirebaseAvailability } from "@/lib/firebase/config"

interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string | null
  description: string
  location: string
  logoUrl?: string
}

// Default education data
const DEFAULT_EDUCATION = [
  {
    id: "1",
    institution: "Stanford University",
    degree: "Master of Science",
    field: "Computer Science",
    startDate: "2015-09-01",
    endDate: "2017-06-30",
    description: "Specialized in Artificial Intelligence and Machine Learning.",
    location: "Stanford, CA",
  },
  {
    id: "2",
    institution: "University of Washington",
    degree: "Bachelor of Science",
    field: "Computer Engineering",
    startDate: "2011-09-01",
    endDate: "2015-06-30",
    description: "Graduated with honors. Participated in various hackathons and coding competitions.",
    location: "Seattle, WA",
  },
]

export function EducationSection() {
  const [education, setEducation] = useState<Education[]>([])
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
          console.log("Firebase is not available. Using default education data in component.")
          if (isMounted) {
            setEducation(DEFAULT_EDUCATION)
            setIsVisible(true)
            setIsLoading(false)
          }
          return
        }

        // Fetch education and visibility in parallel with error handling
        const educationPromise = fetchEducation().catch((err) => {
          console.error("Error fetching education:", err)
          return DEFAULT_EDUCATION
        })

        const visibilityPromise = fetchSectionVisibility("education").catch((err) => {
          console.error("Error fetching section visibility:", err)
          return true
        })

        const [educationData, visibilityData] = await Promise.all([educationPromise, visibilityPromise])

        // Sort by date (most recent first)
        const sortedEducation = educationData.sort((a, b) => {
          const dateA = a.endDate || new Date().toISOString()
          const dateB = b.endDate || new Date().toISOString()
          return new Date(dateB).getTime() - new Date(dateA).getTime()
        })

        if (isMounted) {
          setEducation(sortedEducation)
          setIsVisible(visibilityData)
        }
      } catch (err) {
        console.error("Error loading education section:", err)
        if (isMounted) {
          setEducation(DEFAULT_EDUCATION)
          setError("Using default education data due to connection issues.")
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
    <section id="education" className="py-12">
      <h2 className="mb-8 text-3xl font-bold">Education</h2>
      {error && (
        <div className="mb-4 rounded-md bg-amber-50 p-4 text-amber-800">
          <p>{error}</p>
        </div>
      )}
      <div className="space-y-6">
        {education.length > 0 ? (
          education.map((edu) => {
            const startDate = new Date(edu.startDate)
            const endDate = edu.endDate ? new Date(edu.endDate) : null

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
              <Card key={edu.id}>
                <CardHeader>
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      {edu.logoUrl && (
                        <div className="hidden sm:block relative h-12 w-12 overflow-hidden rounded-md border">
                          <img
                            src={edu.logoUrl || "/placeholder.svg"}
                            alt={`${edu.institution} logo`}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                      <div>
                        <CardTitle>
                          {edu.degree} in {edu.field}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {edu.institution} • {edu.location}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formattedStartDate} - {formattedEndDate}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{edu.description}</p>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No education entries to display.</p>
          </Card>
        )}
      </div>
    </section>
  )
}
