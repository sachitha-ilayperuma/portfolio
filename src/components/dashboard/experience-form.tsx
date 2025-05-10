"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { addExperience, updateExperience } from "@/lib/firebase/experiences"

interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string | null
  description: string
  location: string
}

interface ExperienceFormProps {
  experience: Experience | null
  onSave: (experience: Experience) => void
  onCancel: () => void
}

export function ExperienceForm({ experience, onSave, onCancel }: ExperienceFormProps) {
  const [formData, setFormData] = useState<Omit<Experience, "id">>({
    company: "",
    position: "",
    startDate: "",
    endDate: null,
    description: "",
    location: "",
  })
  const [currentlyWorking, setCurrentlyWorking] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (experience) {
      setFormData({
        company: experience.company,
        position: experience.position,
        startDate: experience.startDate.split("T")[0], // Format date for input
        endDate: experience.endDate ? experience.endDate.split("T")[0] : null,
        description: experience.description,
        location: experience.location,
      })
      setCurrentlyWorking(!experience.endDate)
    }
  }, [experience])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCurrentlyWorkingChange = (checked: boolean) => {
    setCurrentlyWorking(checked)
    if (checked) {
      setFormData((prev) => ({ ...prev, endDate: null }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let savedExperience: Experience

      // Format dates to ISO strings
      const formattedData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      }

      if (experience) {
        // Update existing experience
        savedExperience = await updateExperience(experience.id, formattedData)
        toast({
          title: "Success",
          description: "Experience updated successfully",
        })
      } else {
        // Add new experience
        savedExperience = await addExperience(formattedData)
        toast({
          title: "Success",
          description: "Experience added successfully",
        })
      }

      onSave(savedExperience)
    } catch (error) {
      console.error("Error saving experience:", error)
      toast({
        title: "Error",
        description: "Failed to save experience",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" value={formData.company} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input id="position" name="position" value={formData.position} onChange={handleChange} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" value={formData.location} onChange={handleChange} required />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate || ""}
            onChange={handleChange}
            disabled={currentlyWorking}
          />
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="currentlyWorking" checked={currentlyWorking} onCheckedChange={handleCurrentlyWorkingChange} />
            <label
              htmlFor="currentlyWorking"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I currently work here
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
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
          {isSubmitting ? "Saving..." : experience ? "Update Experience" : "Add Experience"}
        </Button>
      </div>
    </form>
  )
}
