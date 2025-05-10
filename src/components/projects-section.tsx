"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ExternalLink, Github, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchProjects } from "@/lib/firebase/projects"
import { fetchSectionVisibility } from "@/lib/firebase/sections"
import { checkFirebaseAvailability } from "@/lib/firebase/config"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggerIn } from "@/components/animations/stagger-in"

interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  imageUrl: string
  demoUrl?: string
  githubUrl?: string
}

// Default projects data
const DEFAULT_PROJECTS: Project[] = [
  {
    id: "1",
    title: "E-commerce Platform",
    description: "A full-featured e-commerce platform with product management, shopping cart, and payment processing.",
    technologies: ["React", "Node.js", "MongoDB", "Stripe"],
    imageUrl: "/placeholder.svg?height=200&width=400",
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/example/ecommerce",
  },
  {
    id: "2",
    title: "Task Management App",
    description: "A productivity application for managing tasks, projects, and team collaboration.",
    technologies: ["Next.js", "TypeScript", "Firebase", "Tailwind CSS"],
    imageUrl: "/placeholder.svg?height=200&width=400",
    githubUrl: "https://github.com/example/taskmanager",
  },
]

// Function to get color for project card based on index
function getProjectColor(index: number): string {
  // Cycle through our three colors
  switch (index % 3) {
    case 0:
      return "border-[#020447]/20" // Dark blue
    case 1:
      return "border-[#0662b8]/20" // Medium blue
    case 2:
      return "border-[#660505]/20" // Dark red
    default:
      return "border-[#0662b8]/20" // Medium blue
  }
}

// Function to get badge color based on technology name
function getBadgeColor(tech: string): string {
  // Assign colors based on technology type
  if (["React", "Next.js", "Vue", "Angular", "TypeScript", "JavaScript"].includes(tech)) {
    return "bg-[#020447] text-white hover:bg-[#020447]/90" // Frontend - Dark blue
  } else if (["Node.js", "Express", "Django", "Flask", "MongoDB", "PostgreSQL", "MySQL", "Firebase"].includes(tech)) {
    return "bg-[#0662b8] text-white hover:bg-[#0662b8]/90" // Backend - Medium blue
  } else {
    return "bg-[#660505] text-white hover:bg-[#660505]/90" // Other - Dark red
  }
}

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([])
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
          console.log("Firebase is not available. Using default projects data in component.")
          if (isMounted) {
            setProjects(DEFAULT_PROJECTS)
            setIsVisible(true)
            setIsLoading(false)
          }
          return
        }

        // Fetch projects and visibility in parallel with error handling
        const projectsPromise = fetchProjects().catch((err) => {
          console.error("Error fetching projects:", err)
          return DEFAULT_PROJECTS
        })

        const visibilityPromise = fetchSectionVisibility("projects").catch((err) => {
          console.error("Error fetching section visibility:", err)
          return true
        })

        const [projectsData, visibilityData] = await Promise.all([projectsPromise, visibilityPromise])

        if (isMounted) {
          setProjects(projectsData)
          setIsVisible(visibilityData)
        }
      } catch (err) {
        console.error("Error loading projects section:", err)
        if (isMounted) {
          setProjects(DEFAULT_PROJECTS)
          setError("Using default projects data due to connection issues.")
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
    <section id="projects" className="py-12">
      <FadeIn direction="up">
        <h2 className="mb-8 text-3xl font-bold">Projects</h2>
      </FadeIn>
      {error && (
        <div className="mb-4 rounded-md bg-amber-50 p-4 text-amber-800">
          <p>{error}</p>
        </div>
      )}
      {projects.length > 0 ? (
        <StaggerIn
          direction="up"
          delayIncrement={0.1}
          initialDelay={0.2}
          threshold={0.1}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {projects.map((project, index) => (
            <Card key={project.id} className={`overflow-hidden flex flex-col border-2 ${getProjectColor(index)}`}>
              <Link href={`/projects/${project.id}`} className="group">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={project.imageUrl || "/placeholder.svg?height=200&width=400"}
                    alt={project.title}
                    className="h-full w-full object-cover transition-all group-hover:scale-105"
                  />
                </div>
              </Link>
              <CardHeader>
                <Link href={`/projects/${project.id}`} className="hover:underline">
                  <CardTitle>{project.title}</CardTitle>
                </Link>
                <CardDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} className={getBadgeColor(tech)}>
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{project.description}</p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant={index % 3 === 2 ? "accent" : "default"}
                  size="sm"
                  asChild
                  className="text-white" // Add explicit text color to ensure visibility
                >
                  <Link href={`/projects/${project.id}`}>
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <div className="flex-grow"></div>
                {project.demoUrl && (
                  <Button variant="outline" size="icon" asChild title="Live Demo">
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Live Demo</span>
                    </a>
                  </Button>
                )}
                {project.githubUrl && (
                  <Button variant="outline" size="icon" asChild title="Source Code">
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                      <span className="sr-only">Source Code</span>
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </StaggerIn>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No projects to display.</p>
        </Card>
      )}
    </section>
  )
}
