"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchEducation } from "@/lib/firebase/education"
import { fetchSectionVisibility } from "@/lib/firebase/sections"

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

export function EducationSection() {
  const [education, setEducation] = useState<Education[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [educationData, visibilityData] = await Promise.all([
          fetchEducation(),
          fetchSectionVisibility("education"),
        ])

        // Sort by date (most recent first)
        const sortedEducation = educationData.sort((a, b) => {
          const dateA = a.endDate || new Date().toISOString()
          const dateB = b.endDate || new Date().toISOString()
          return new Date(dateB).getTime() - new Date(dateA).getTime()
        })

        setEducation(sortedEducation)
        setIsVisible(visibilityData)
      } catch (error) {
        console.error("Error loading education section:", error)
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
    <section id="education" className="py-12">
      <h2 className="mb-8 text-3xl font-bold">Education</h2>
      <div className="space-y-6">
        {education.map((edu) => {
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
        })}
      </div>
    </section>
  )
}
