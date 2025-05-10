"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { InterestForm } from "@/components/dashboard/interest-form"
import { fetchInterests, deleteInterest } from "@/lib/firebase/interests"
import { Loader } from "@/components/ui/loader"

interface Interest {
  id: string
  name: string
  description: string
  icon?: string
}

export default function InterestsPage() {
  const [interests, setInterests] = useState<Interest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [interestToEdit, setInterestToEdit] = useState<Interest | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [interestToDelete, setInterestToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadInterests = async () => {
      try {
        const interestsData = await fetchInterests()
        setInterests(interestsData)
      } catch (error) {
        console.error("Error loading interests:", error)
        toast({
          title: "Error",
          description: "Failed to load interests",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadInterests()
  }, [toast])

  const handleEditInterest = (interest: Interest) => {
    setInterestToEdit(interest)
    setIsDialogOpen(true)
  }

  const handleDeleteInterest = async () => {
    if (!interestToDelete) return

    try {
      await deleteInterest(interestToDelete)
      setInterests(interests.filter((i) => i.id !== interestToDelete))
      toast({
        title: "Success",
        description: "Interest deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting interest:", error)
      toast({
        title: "Error",
        description: "Failed to delete interest",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setInterestToDelete(null)
    }
  }

  const confirmDelete = (interestId: string) => {
    setInterestToDelete(interestId)
    setIsDeleteDialogOpen(true)
  }

  const handleInterestSaved = (savedInterest: Interest) => {
    if (interestToEdit) {
      // Update existing interest
      setInterests(interests.map((i) => (i.id === savedInterest.id ? savedInterest : i)))
    } else {
      // Add new interest
      setInterests([...interests, savedInterest])
    }
    setIsDialogOpen(false)
    setInterestToEdit(null)
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Interests</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setInterestToEdit(null)}>
              <Plus className="mr-2 h-4 w-4" /> Add Interest
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{interestToEdit ? "Edit Interest" : "Add New Interest"}</DialogTitle>
              <DialogDescription>
                {interestToEdit ? "Update your interest details below" : "Fill in the details for your new interest"}
              </DialogDescription>
            </DialogHeader>
            <InterestForm
              interest={interestToEdit}
              onSave={handleInterestSaved}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {interests.map((interest) => (
          <Card key={interest.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-xl">{interest.icon || "🔍"}</span>
                </div>
                <CardTitle>{interest.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{interest.description}</p>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleEditInterest(interest)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={() => confirmDelete(interest.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {interests.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No interests yet. Click "Add Interest" to create your first entry.</p>
        </Card>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this interest? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteInterest}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
