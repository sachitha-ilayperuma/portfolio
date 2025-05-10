"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { addSkill, updateSkill } from "@/lib/firebase/skills"

interface Skill {
  id: string
  name: string
  category: string
}

interface SkillFormProps {
  skill: Skill | null
  onSave: (skill: Skill) => void
  onCancel: () => void
}

export function SkillForm({ skill, onSave, onCancel }: SkillFormProps) {
  const [formData, setFormData] = useState<Omit<Skill, "id">>({
    name: "",
    category: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (skill) {
      setFormData({
        name: skill.name,
        category: skill.category,
      })
    }
  }, [skill])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let savedSkill: Skill

      if (skill) {
        // Update existing skill
        savedSkill = await updateSkill(skill.id, formData)
        toast({
          title: "Success",
          description: "Skill updated successfully",
        })
      } else {
        // Add new skill
        savedSkill = await addSkill(formData)
        toast({
          title: "Success",
          description: "Skill added successfully",
        })
      }

      onSave(savedSkill)
    } catch (error) {
      console.error("Error saving skill:", error)
      toast({
        title: "Error",
        description: "Failed to save skill",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Skill Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={handleCategoryChange} required>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Frontend">Frontend</SelectItem>
            <SelectItem value="Backend">Backend</SelectItem>
            <SelectItem value="DevOps & Cloud">DevOps & Cloud</SelectItem>
            <SelectItem value="Tools">Tools</SelectItem>
            <SelectItem value="Soft Skills">Soft Skills</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : skill ? "Update Skill" : "Add Skill"}
        </Button>
      </div>
    </form>
  )
}
