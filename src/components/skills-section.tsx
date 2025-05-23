"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { fetchSkills } from "@/lib/firebase/skills"
import { fetchSkillCategories, type SkillCategory } from "@/lib/firebase/skill-categories"
import { fetchSectionVisibility } from "@/lib/firebase/sections"
import { checkFirebaseAvailability } from "@/lib/firebase/config"
import {
  Code,
  Database,
  Server,
  Globe,
  Cpu,
  GitBranch,
  Layers,
  Workflow,
  BrainCircuit,
  Users,
  Cloud,
  Terminal,
  Laptop,
  Smartphone,
  Zap,
  FileCode,
  Puzzle,
  PenToolIcon as Tool,
  Wrench,
  Settings,
  type LucideIcon,
} from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggerIn } from "@/components/animations/stagger-in"

interface Skill {
  id: string
  name: string
  category: string
  icon?: string
  iconUrl?: string
  order?: number
}

// Default skills data
const DEFAULT_SKILLS: Skill[] = [
  { id: "1", name: "JavaScript", category: "Frontend", icon: "Code", order: 1 },
  { id: "2", name: "React", category: "Frontend", icon: "Code", order: 2 },
  { id: "3", name: "TypeScript", category: "Frontend", icon: "Code", order: 3 },
  { id: "4", name: "HTML/CSS", category: "Frontend", icon: "Globe", order: 4 },
  { id: "5", name: "Node.js", category: "Backend", icon: "Server", order: 1 },
  { id: "6", name: "Express", category: "Backend", icon: "Server", order: 2 },
  { id: "7", name: "MongoDB", category: "Backend", icon: "Database", order: 3 },
  { id: "8", name: "PostgreSQL", category: "Backend", icon: "Database", order: 4 },
  { id: "9", name: "AWS", category: "DevOps & Cloud", icon: "Cloud", order: 1 },
  { id: "10", name: "Docker", category: "DevOps & Cloud", icon: "Layers", order: 2 },
  { id: "11", name: "Git", category: "Tools", icon: "GitBranch", order: 1 },
  { id: "12", name: "Agile Methodologies", category: "Soft Skills", icon: "Users", order: 1 },
]

// Default categories with order
const DEFAULT_CATEGORIES: SkillCategory[] = [
  { id: "frontend", name: "Frontend", order: 1 },
  { id: "backend", name: "Backend", order: 2 },
  { id: "devops", name: "DevOps & Cloud", order: 3 },
  { id: "tools", name: "Tools", order: 4 },
  { id: "softskills", name: "Soft Skills", order: 5 },
  { id: "other", name: "Other", order: 6 },
]

// Map of icon names to components
const iconComponents: Record<string, LucideIcon> = {
  Code,
  Database,
  Server,
  Globe,
  Cpu,
  GitBranch,
  Layers,
  Workflow,
  BrainCircuit,
  Users,
  Cloud,
  Terminal,
  Laptop,
  Smartphone,
  Zap,
  FileCode,
  Puzzle,
  Tool,
  Wrench,
  Settings,
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
  const [categories, setCategories] = useState<SkillCategory[]>([])
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
          console.log("Firebase is not available. Using default data in component.")
          if (isMounted) {
            setSkills(DEFAULT_SKILLS)
            setCategories(DEFAULT_CATEGORIES)
            setIsVisible(true)
            setIsLoading(false)
          }
          return
        }

        // Fetch skills, categories, and visibility in parallel with error handling
        const skillsPromise = fetchSkills().catch((err) => {
          console.error("Error fetching skills:", err)
          return DEFAULT_SKILLS
        })

        const categoriesPromise = fetchSkillCategories().catch((err) => {
          console.error("Error fetching skill categories:", err)
          return DEFAULT_CATEGORIES
        })

        const visibilityPromise = fetchSectionVisibility("skills").catch((err) => {
          console.error("Error fetching section visibility:", err)
          return true
        })

        const [skillsData, categoriesData, visibilityData] = await Promise.all([
          skillsPromise,
          categoriesPromise,
          visibilityPromise,
        ])

        if (isMounted) {
          setSkills(skillsData)
          setCategories(categoriesData)
          setIsVisible(visibilityData)
        }
      } catch (err) {
        console.error("Error loading skills section:", err)
        if (isMounted) {
          setSkills(DEFAULT_SKILLS)
          setCategories(DEFAULT_CATEGORIES)
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

  // Function to render the icon for a skill
  const renderSkillIcon = (skill: Skill) => {
    // Priority 1: Use custom uploaded icon if available
    if (skill.iconUrl) {
      return (
        <div className="h-full w-full overflow-hidden rounded-full">
          <img src={skill.iconUrl || "/placeholder.svg"} alt={skill.name} className="h-full w-full object-cover" />
        </div>
      )
    }

    // Priority 2: Use built-in Lucide icon if specified
    if (skill.icon && iconComponents[skill.icon]) {
      const IconComponent = iconComponents[skill.icon]
      return <IconComponent className="h-5 w-5" />
    }

    // Priority 3: Fall back to default icon
    return defaultIcon
  }

  // Sort skills by order within each category
  const getSortedSkills = (categoryName: string, skillsList: Skill[]) => {
    return [...skillsList]
      .filter((skill) => skill.category === categoryName)
      .sort((a, b) => {
        // Default to 1 if order is not specified (instead of 999)
        const orderA = a.order ?? 1
        const orderB = b.order ?? 1
        return orderA - orderB
      })
  }

  // Sort categories by their order
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order)

  if (isLoading) {
    return <div className="h-60 w-full animate-pulse rounded-lg bg-muted"></div>
  }

  if (!isVisible) {
    return null
  }

  return (
    <section id="skills" className="py-12">
      <FadeIn direction="up">
        <h2 className="mb-8 text-3xl font-bold">Skills</h2>
      </FadeIn>
      {error && (
        <div className="mb-4 rounded-md bg-amber-50 p-4 text-amber-800">
          <p>{error}</p>
        </div>
      )}
      <StaggerIn direction="up" delayIncrement={0.15} threshold={0.1} className="grid gap-6 md:grid-cols-2">
        {sortedCategories.map((category) => {
          // Get skills for this category
          const categorySkills = getSortedSkills(category.name, skills)

          // Skip empty categories
          if (categorySkills.length === 0) return null

          const colorStyle = getCategoryColor(category.name)
          const borderColor = getCategoryBorderColor(category.name)
          const headingColor = getCategoryHeadingColor(category.name)

          return (
            <Card key={category.id} className={`border-2 ${borderColor} h-full`}>
              <CardContent className="p-6 h-full flex flex-col">
                <h3 className={`mb-4 text-xl font-semibold ${headingColor}`}>{category.name}</h3>
                <StaggerIn direction="up" delayIncrement={0.05} initialDelay={0.1} className="grid grid-cols-2 gap-4 flex-grow">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${colorStyle.bg} ${colorStyle.text}`}
                      >
                        {renderSkillIcon(skill)}
                      </div>
                      <span className="font-medium">{skill.name}</span>
                    </div>
                  ))}
                </StaggerIn>
              </CardContent>
            </Card>
          )
        })}
      </StaggerIn>
    </section>
  )
}
