"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { addInterest, updateInterest } from "@/lib/firebase/interests"

interface Interest {
  id: string
  name: string
  description: string
  icon?: string
}

interface InterestFormProps {
  interest: Interest | null
  onSave: (interest: Interest) => void
  onCancel: () => void
}

export function InterestForm({ interest, onSave, onCancel }: InterestFormProps) {
  const [formData, setFormData] = useState<Omit<Interest, "id">>({
    name: "",
    description: "",
    icon: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (interest) {
      setFormData({
        name: interest.name,
        description: interest.description,
        icon: interest.icon || "",
      })
    }
  }, [interest])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let savedInterest: Interest

      if (interest) {
        // Update existing interest
        savedInterest = await updateInterest(interest.id, formData)
        toast({
          title: "Success",
          description: "Interest updated successfully",
        })
      } else {
        // Add new interest
        savedInterest = await addInterest(formData)
        toast({
          title: "Success",
          description: "Interest added successfully",
        })
      }

      onSave(savedInterest)
    } catch (error) {
      console.error("Error saving interest:", error)
      toast({
        title: "Error",
        description: "Failed to save interest",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Interest Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Icon (emoji or symbol)</Label>
        <Input id="icon" name="icon" value={formData.icon} onChange={handleChange} placeholder="🔍" />
        <p className="text-xs text-muted-foreground">
          Use an emoji or symbol to represent this interest (e.g., 🔍, 🌐, 🤖)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : interest ? "Update Interest" : "Add Interest"}
        </Button>
      </div>
    </form>
  )
}
