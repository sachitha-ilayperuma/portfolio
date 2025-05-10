"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { SkillForm } from "@/components/dashboard/skill-form"
import { fetchSkills, deleteSkill } from "@/lib/firebase/skills"
import { Loader } from "@/components/ui/loader"

interface Skill {
  id: string
  name: string
  category: string
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [skillToEdit, setSkillToEdit] = useState<Skill | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [skillToDelete, setSkillToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const skillsData = await fetchSkills()
        setSkills(skillsData)
      } catch (error) {
        console.error("Error loading skills:", error)
        toast({
          title: "Error",
          description: "Failed to load skills",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSkills()
  }, [toast])

  const handleEditSkill = (skill: Skill) => {
    setSkillToEdit(skill)
    setIsDialogOpen(true)
  }

  const handleDeleteSkill = async () => {
    if (!skillToDelete) return

    try {
      await deleteSkill(skillToDelete)
      setSkills(skills.filter((s) => s.id !== skillToDelete))
      toast({
        title: "Success",
        description: "Skill deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting skill:", error)
      toast({
        title: "Error",
        description: "Failed to delete skill",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSkillToDelete(null)
    }
  }

  const confirmDelete = (skillId: string) => {
    setSkillToDelete(skillId)
    setIsDeleteDialogOpen(true)
  }

  const handleSkillSaved = (savedSkill: Skill) => {
    if (skillToEdit) {
      // Update existing skill
      setSkills(skills.map((s) => (s.id === savedSkill.id ? savedSkill : s)))
    } else {
      // Add new skill
      setSkills([...skills, savedSkill])
    }
    setIsDialogOpen(false)
    setSkillToEdit(null)
  }

  if (isLoading) {
    return <Loader />
  }

  // Group skills by category
  const skillsByCategory = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    },
    {} as Record<string, Skill[]>,
  )

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Skills</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSkillToEdit(null)}>
              <Plus className="mr-2 h-4 w-4" /> Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{skillToEdit ? "Edit Skill" : "Add New Skill"}</DialogTitle>
              <DialogDescription>
                {skillToEdit ? "Update your skill details below" : "Fill in the details for your new skill"}
              </DialogDescription>
            </DialogHeader>
            <SkillForm skill={skillToEdit} onSave={handleSkillSaved} onCancel={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
        <Card key={category} className="overflow-hidden">
          <CardHeader>
            <CardTitle>{category}</CardTitle>
            <CardDescription>Skills in {category} category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categorySkills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between rounded-md border p-4">
                  <div className="font-medium">{skill.name}</div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditSkill(skill)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive"
                      onClick={() => confirmDelete(skill.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {skills.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No skills yet. Click "Add Skill" to create your first skill.</p>
        </Card>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this skill? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSkill}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
