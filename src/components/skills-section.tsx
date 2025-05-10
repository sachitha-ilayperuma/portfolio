"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { fetchSkills } from "@/lib/firebase/skills"
import { fetchSectionVisibility } from "@/lib/firebase/sections"
import { checkFirebaseAvailability } from "@/lib/firebase/config"
import { Code, Database, Server, Globe, Cpu, GitBranch, Layers, Workflow, BrainCircuit, Users } from "lucide-react"

interface Skill {
  id: string
  name: string
  category: string
}

// Default skills data
const DEFAULT_SKILLS: Skill[] = [
  { id: "1", name: "JavaScript", category: "Frontend" },
  { id: "2", name: "React", category: "Frontend" },
  { id: "3", name: "TypeScript", category: "Frontend" },
  { id: "4", name: "HTML/CSS", category: "Frontend" },
  { id: "5", name: "Node.js", category: "Backend" },
  { id: "6", name: "Express", category: "Backend" },
  { id: "7", name: "MongoDB", category: "Backend" },
  { id: "8", name: "PostgreSQL", category: "Backend" },
  { id: "9", name: "AWS", category: "DevOps & Cloud" },
  { id: "10", name: "Docker", category: "DevOps & Cloud" },
  { id: "11", name: "Git", category: "Tools" },
  { id: "12", name: "Agile Methodologies", category: "Soft Skills" },
]

// Map of skill names to icons
const skillIcons: Record<string, React.ReactNode> = {
  // Frontend
  JavaScript: <Code className="h-5 w-5" />,
  TypeScript: <Code className="h-5 w-5" />,
  React: <Code className="h-5 w-5" />,
  "Next.js": <Code className="h-5 w-5" />,
  "HTML/CSS": <Globe className="h-5 w-5" />,
  "Tailwind CSS": <Code className="h-5 w-5" />,

  // Backend
  "Node.js": <Server className="h-5 w-5" />,
  Express: <Server className="h-5 w-5" />,
  GraphQL: <Database className="h-5 w-5" />,
  "REST API Design": <Globe className="h-5 w-5" />,
  MongoDB: <Database className="h-5 w-5" />,
  PostgreSQL: <Database className="h-5 w-5" />,

  // DevOps & Cloud
  AWS: <Server className="h-5 w-5" />,
  Docker: <Layers className="h-5 w-5" />,
  "CI/CD": <Workflow className="h-5 w-5" />,
  Firebase: <Database className="h-5 w-5" />,

  // Other
  Git: <GitBranch className="h-5 w-5" />,
  Testing: <Cpu className="h-5 w-5" />,
  "Agile Methodologies": <Workflow className="h-5 w-5" />,
  "Technical Leadership": <Users className="h-5 w-5" />,
  "Machine Learning": <BrainCircuit className="h-5 w-5" />,
}

// Default icon for skills without a specific icon
const defaultIcon = <Code className="h-5 w-5" />

// Function to get color based on category - using all three colors
function getCategoryColor(category: string): { bg: string; text: string } {
  switch (category) {
    case "Frontend":
      return { bg: "bg-[#020447]/10", text: "text-[#020447] dark:text-white" } // Dark blue
    case "Backend":
      return { bg: "bg-[#0662b8]/10", text: "text-[#0662b8] dark:text-white" } // Medium blue
    case "DevOps & Cloud":
      return { bg: "bg-[#660505]/10", text: "text-[#660505] dark:text-white" } // Dark red
    case "Tools":
      return { bg: "bg-[#020447]/10", text: "text-[#020447] dark:text-white" } // Dark blue
    case "Soft Skills":
      return { bg: "bg-[#0662b8]/10", text: "text-[#0662b8] dark:text-white" } // Medium blue
    default:
      return { bg: "bg-[#660505]/10", text: "text-[#660505] dark:text-white" } // Dark red
  }
}

// Function to get card border color based on category - using all three colors
function getCategoryBorderColor(category: string): string {
  switch (category) {
    case "Frontend":
      return "border-[#020447]/20" // Dark blue
    case "Backend":
      return "border-[#0662b8]/20" // Medium blue
    case "DevOps & Cloud":
      return "border-[#660505]/20" // Dark red
    case "Tools":
      return "border-[#020447]/20" // Dark blue
    case "Soft Skills":
      return "border-[#0662b8]/20" // Medium blue
    default:
      return "border-[#660505]/20" // Dark red
  }
}

// Function to get heading color based on category - using all three colors
function getCategoryHeadingColor(category: string): string {
  switch (category) {
    case "Frontend":
      return "text-[#020447] dark:text-white" // Dark blue
    case "Backend":
      return "text-[#0662b8] dark:text-white" // Medium blue
    case "DevOps & Cloud":
      return "text-[#660505] dark:text-white" // Dark red
    case "Tools":
      return "text-[#020447] dark:text-white" // Dark blue
    case "Soft Skills":
      return "text-[#0662b8] dark:text-white" // Medium blue
    default:
      return "text-[#660505] dark:text-white" // Dark red
  }
}

export function SkillsSection() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
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
          console.log("Firebase is not available. Using default skills data in component.")
          if (isMounted) {
            setSkills(DEFAULT_SKILLS)

            // Extract unique categories from default skills
            const uniqueCategories = Array.from(new Set(DEFAULT_SKILLS.map((skill) => skill.category)))
            setCategories(uniqueCategories)

            setIsVisible(true)
            setIsLoading(false)
          }
          return
        }

        // Fetch skills and visibility in parallel with error handling
        const skillsPromise = fetchSkills().catch((err) => {
          console.error("Error fetching skills:", err)
          return DEFAULT_SKILLS
        })

        const visibilityPromise = fetchSectionVisibility("skills").catch((err) => {
          console.error("Error fetching section visibility:", err)
          return true
        })

        const [skillsData, visibilityData] = await Promise.all([skillsPromise, visibilityPromise])

        // Remove the level property from skills if it exists
        const simplifiedSkills = skillsData.map(({ id, name, category }) => ({ id, name, category }))

        if (isMounted) {
          setSkills(simplifiedSkills)

          // Extract unique categories
          const uniqueCategories = Array.from(new Set(simplifiedSkills.map((skill) => skill.category)))
          setCategories(uniqueCategories)

          setIsVisible(visibilityData)
        }
      } catch (err) {
        console.error("Error loading skills section:", err)
        if (isMounted) {
          setSkills(DEFAULT_SKILLS)

          // Extract unique categories from default skills
          const uniqueCategories = Array.from(new Set(DEFAULT_SKILLS.map((skill) => skill.category)))
          setCategories(uniqueCategories)

          setError("Using default skills data due to connection issues.")
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
    return <div className="h-40 w-full animate-pulse rounded-lg bg-muted"></div>
  }

  if (!isVisible) {
    return null
  }

  return (
    <section id="skills" className="py-12">
      <h2 className="mb-8 text-3xl font-bold">Skills</h2>
      {error && (
        <div className="mb-4 rounded-md bg-amber-50 p-4 text-amber-800">
          <p>{error}</p>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((category) => {
          const categorySkills = skills.filter((skill) => skill.category === category)
          const colorStyle = getCategoryColor(category)
          const borderColor = getCategoryBorderColor(category)
          const headingColor = getCategoryHeadingColor(category)

          return (
            <Card key={category} className={`border-2 ${borderColor}`}>
              <CardContent className="p-6">
                <h3 className={`mb-4 text-xl font-semibold ${headingColor}`}>{category}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${colorStyle.bg} ${colorStyle.text}`}
                      >
                        {skillIcons[skill.name] || defaultIcon}
                      </div>
                      <span className="font-medium">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
