"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Github, Calendar, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { fetchProject } from "@/lib/firebase/projects"
import { Loader } from "@/components/ui/loader"

interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  imageUrl: string
  demoUrl?: string
  githubUrl?: string
  detailedDescription?: string
  role?: string
  contribution?: string
  additionalImages?: string[]
  features?: string[]
  challenges?: string
  duration?: string
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true)
        const projectData = await fetchProject(params.id)
        setProject(projectData)
      } catch (error) {
        console.error("Error loading project:", error)
        setError("Failed to load project details. The project may not exist.")
      } finally {
        setIsLoading(false)
      }
    }

    loadProject()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="container py-12">
        <Loader />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || "The requested project could not be found."}</p>
            <Button asChild>
              <Link href="/#projects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/#projects">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <div>
          <h1 className="text-3xl font-bold mb-2">{project.title}</h1>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.technologies.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>

          <div className="aspect-video w-full overflow-hidden rounded-lg border mb-6">
            <img
              src={project.imageUrl || "/placeholder.svg?height=400&width=800"}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          </div>

          {project.additionalImages && project.additionalImages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Project Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {project.additionalImages.map((imageUrl, index) => (
                  <div key={index} className="aspect-video overflow-hidden rounded-lg border">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={`${project.title} screenshot ${index + 1}`}
                      className="h-full w-full object-cover transition-all hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Project Overview</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {project.detailedDescription || project.description}
              </p>
            </div>

            {project.features && project.features.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Key Features</h2>
                <ul className="space-y-2">
                  {project.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.challenges && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Challenges & Solutions</h2>
                <p className="text-muted-foreground whitespace-pre-line">{project.challenges}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-1">My Role</h3>
                <p>{project.role || "Developer"}</p>
              </div>

              {project.duration && (
                <div>
                  <h3 className="font-semibold mb-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" /> Duration
                  </h3>
                  <p>{project.duration}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-1">My Contribution</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {project.contribution || "I was responsible for the full development of this project."}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                {project.demoUrl && (
                  <Button asChild>
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Live Demo
                    </a>
                  </Button>
                )}
                {project.githubUrl && (
                  <Button variant="outline" asChild>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      View Source Code
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
