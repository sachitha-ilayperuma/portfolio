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
import { EducationForm } from "@/components/dashboard/education-form"
import { fetchEducation, deleteEducation } from "@/lib/firebase/education"
import { Loader } from "@/components/ui/loader"

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

export default function EducationPage() {
  const [education, setEducation] = useState<Education[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [educationToEdit, setEducationToEdit] = useState<Education | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [educationToDelete, setEducationToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadEducation = async () => {
      try {
        const educationData = await fetchEducation()

        // Sort by date (most recent first)
        const sortedEducation = educationData.sort((a, b) => {
          const dateA = a.endDate || new Date().toISOString()
          const dateB = b.endDate || new Date().toISOString()
          return new Date(dateB).getTime() - new Date(dateA).getTime()
        })

        setEducation(sortedEducation)
      } catch (error) {
        console.error("Error loading education:", error)
        toast({
          title: "Error",
          description: "Failed to load education",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadEducation()
  }, [toast])

  const handleEditEducation = (edu: Education) => {
    setEducationToEdit(edu)
    setIsDialogOpen(true)
  }

  const handleDeleteEducation = async () => {
    if (!educationToDelete) return

    try {
      await deleteEducation(educationToDelete)
      setEducation(education.filter((e) => e.id !== educationToDelete))
      toast({
        title: "Success",
        description: "Education deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting education:", error)
      toast({
        title: "Error",
        description: "Failed to delete education",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setEducationToDelete(null)
    }
  }

  const confirmDelete = (educationId: string) => {
    setEducationToDelete(educationId)
    setIsDeleteDialogOpen(true)
  }

  const handleEducationSaved = (savedEducation: Education) => {
    if (educationToEdit) {
      // Update existing education
      setEducation(education.map((e) => (e.id === savedEducation.id ? savedEducation : e)))
    } else {
      // Add new education
      setEducation([...education, savedEducation])
    }
    setIsDialogOpen(false)
    setEducationToEdit(null)
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Education</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEducationToEdit(null)}>
              <Plus className="mr-2 h-4 w-4" /> Add Education
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{educationToEdit ? "Edit Education" : "Add New Education"}</DialogTitle>
              <DialogDescription>
                {educationToEdit ? "Update your education details below" : "Fill in the details for your new education"}
              </DialogDescription>
            </DialogHeader>
            <EducationForm
              education={educationToEdit}
              onSave={handleEducationSaved}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
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
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEditEducation(edu)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => confirmDelete(edu.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {education.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No education yet. Click "Add Education" to create your first entry.</p>
        </Card>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this education? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEducation}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
