"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { addEducation, updateEducation } from "@/lib/firebase/education"
import { Upload } from "lucide-react"

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

interface EducationFormProps {
  education: Education | null
  onSave: (education: Education) => void
  onCancel: () => void
}

export function EducationForm({ education, onSave, onCancel }: EducationFormProps) {
  const [formData, setFormData] = useState<Omit<Education, "id">>({
    institution: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: null,
    description: "",
    location: "",
    logoUrl: "",
  })
  const [currentlyStudying, setCurrentlyStudying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (education) {
      setFormData({
        institution: education.institution,
        degree: education.degree,
        field: education.field,
        startDate: education.startDate.split("T")[0], // Format date for input
        endDate: education.endDate ? education.endDate.split("T")[0] : null,
        description: education.description,
        location: education.location,
        logoUrl: education.logoUrl || "",
      })
      setCurrentlyStudying(!education.endDate)
    }
  }, [education])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCurrentlyStudyingChange = (checked: boolean) => {
    setCurrentlyStudying(checked)
    if (checked) {
      setFormData((prev) => ({ ...prev, endDate: null }))
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogoFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let logoUrl = formData.logoUrl || ""

      // Upload new logo if selected
      if (logoFile) {
        // Import the storage function
        const { uploadEducationLogo } = await import("@/lib/firebase/storage")
        logoUrl = await uploadEducationLogo(logoFile)
      }

      // Format dates to ISO strings
      const formattedData = {
        ...formData,
        logoUrl,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      }

      let savedEducation: Education

      if (education) {
        // Update existing education
        savedEducation = await updateEducation(education.id, formattedData)
        toast({
          title: "Success",
          description: "Education updated successfully",
        })
      } else {
        // Add new education
        savedEducation = await addEducation(formattedData)
        toast({
          title: "Success",
          description: "Education added successfully",
        })
      }

      onSave(savedEducation)
    } catch (error) {
      console.error("Error saving education:", error)
      toast({
        title: "Error",
        description: "Failed to save education",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="institution">Institution</Label>
        <Input id="institution" name="institution" value={formData.institution} onChange={handleChange} required />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="degree">Degree</Label>
          <Input id="degree" name="degree" value={formData.degree} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="field">Field of Study</Label>
          <Input id="field" name="field" value={formData.field} onChange={handleChange} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" value={formData.location} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Institution Logo</Label>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-md border-muted-foreground/25">
              <label
                htmlFor="logo-upload"
                className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="mt-2 text-sm text-muted-foreground">Click to upload logo</span>
                <Input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
            </div>
          </div>
          <div className="flex items-center justify-center">
            {(logoPreview || formData.logoUrl) && (
              <div className="relative aspect-square w-32 h-32 overflow-hidden rounded-md border">
                <img
                  src={logoPreview || formData.logoUrl}
                  alt="Institution logo preview"
                  className="h-full w-full object-contain"
                />
              </div>
            )}
          </div>
        </div>
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
            disabled={currentlyStudying}
          />
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="currentlyStudying"
              checked={currentlyStudying}
              onCheckedChange={handleCurrentlyStudyingChange}
            />
            <label
              htmlFor="currentlyStudying"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I am currently studying here
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
          {isSubmitting ? "Saving..." : education ? "Update Education" : "Add Education"}
        </Button>
      </div>
    </form>
  )
}
