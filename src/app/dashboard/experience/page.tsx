"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Edit } from "lucide-react"
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
import { ExperienceForm } from "@/components/dashboard/experience-form"
import { fetchExperiences, deleteExperience } from "@/lib/firebase/experiences"
import { Loader } from "@/components/ui/loader"

interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string | null
  description: string
  location: string
}

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [experienceToEdit, setExperienceToEdit] = useState<Experience | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [experienceToDelete, setExperienceToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadExperiences = async () => {
      try {
        const experiencesData = await fetchExperiences()

        // Sort by date (most recent first)
        const sortedExperiences = experiencesData.sort((a, b) => {
          const dateA = a.endDate || new Date().toISOString()
          const dateB = b.endDate || new Date().toISOString()
          return new Date(dateB).getTime() - new Date(dateA).getTime()
        })

        setExperiences(sortedExperiences)
      } catch (error) {
        console.error("Error loading experiences:", error)
        toast({
          title: "Error",
          description: "Failed to load work experience",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadExperiences()
  }, [toast])

  const handleEditExperience = (experience: Experience) => {
    setExperienceToEdit(experience)
    setIsDialogOpen(true)
  }

  const handleDeleteExperience = async () => {
    if (!experienceToDelete) return

    try {
      await deleteExperience(experienceToDelete)
      setExperiences(experiences.filter((e) => e.id !== experienceToDelete))
      toast({
        title: "Success",
        description: "Experience deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting experience:", error)
      toast({
        title: "Error",
        description: "Failed to delete experience",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setExperienceToDelete(null)
    }
  }

  const confirmDelete = (experienceId: string) => {
    setExperienceToDelete(experienceId)
    setIsDeleteDialogOpen(true)
  }

  const handleExperienceSaved = (savedExperience: Experience) => {
    if (experienceToEdit) {
      // Update existing experience
      setExperiences(experiences.map((e) => (e.id === savedExperience.id ? savedExperience : e)))
    } else {
      // Add new experience
      setExperiences([...experiences, savedExperience])
    }
    setIsDialogOpen(false)
    setExperienceToEdit(null)
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Work Experience</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setExperienceToEdit(null)}>
              <Plus className="mr-2 h-4 w-4" /> Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{experienceToEdit ? "Edit Experience" : "Add New Experience"}</DialogTitle>
              <DialogDescription>
                {experienceToEdit
                  ? "Update your work experience details below"
                  : "Fill in the details for your new work experience"}
              </DialogDescription>
            </DialogHeader>
            <ExperienceForm
              experience={experienceToEdit}
              onSave={handleExperienceSaved}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
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
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEditExperience(experience)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => confirmDelete(experience.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {experiences.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No work experience yet. Click "Add Experience" to create your first entry.
          </p>
        </Card>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this work experience? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteExperience}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
