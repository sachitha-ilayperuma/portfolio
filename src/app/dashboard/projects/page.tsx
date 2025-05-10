"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Edit, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ProjectForm } from "@/components/dashboard/project-form"
import { fetchProjects, deleteProject } from "@/lib/firebase/projects"

interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  imageUrl: string
  demoUrl?: string
  githubUrl?: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await fetchProjects()
        setProjects(projectsData)
      } catch (error) {
        console.error("Error loading projects:", error)
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [toast])

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project)
    setIsDialogOpen(true)
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return

    try {
      await deleteProject(projectToDelete)
      setProjects(projects.filter((p) => p.id !== projectToDelete))
      toast({
        title: "Success",
        description: "Project deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setProjectToDelete(null)
    }
  }

  const confirmDelete = (projectId: string) => {
    setProjectToDelete(projectId)
    setIsDeleteDialogOpen(true)
  }

  const handleProjectSaved = (savedProject: Project) => {
    if (projectToEdit) {
      // Update existing project
      setProjects(projects.map((p) => (p.id === savedProject.id ? savedProject : p)))
    } else {
      // Add new project
      setProjects([...projects, savedProject])
    }
    setIsDialogOpen(false)
    setProjectToEdit(null)
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setProjectToEdit(null)}>
              <Plus className="mr-2 h-4 w-4" /> Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{projectToEdit ? "Edit Project" : "Add New Project"}</DialogTitle>
              <DialogDescription>
                {projectToEdit ? "Update your project details below" : "Fill in the details for your new project"}
              </DialogDescription>
            </DialogHeader>
            <ProjectForm project={projectToEdit} onSave={handleProjectSaved} onCancel={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={project.imageUrl || "/placeholder.svg?height=200&width=400"}
                alt={project.title}
                className="h-full w-full object-cover transition-all hover:scale-105"
              />
            </div>
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>{project.technologies.join(", ")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 text-sm text-muted-foreground">{project.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={() => handleEditProject(project)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive"
                  onClick={() => confirmDelete(project.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
              {project.demoUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Demo
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No projects yet. Click "Add Project" to create your first project.</p>
        </Card>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
