"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Plus, Upload, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { addProject, updateProject } from "@/lib/firebase/projects"
import { uploadProjectImage, uploadAdditionalProjectImage } from "@/lib/firebase/storage"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

interface ProjectFormProps {
  project: Project | null
  onSave: (project: Project) => void
  onCancel: () => void
}

export function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState<Omit<Project, "id">>({
    title: "",
    description: "",
    technologies: [],
    imageUrl: "",
    demoUrl: "",
    githubUrl: "",
    detailedDescription: "",
    role: "",
    contribution: "",
    additionalImages: [],
    features: [],
    challenges: "",
    duration: "",
  })
  const [technology, setTechnology] = useState("")
  const [feature, setFeature] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [additionalImageFile, setAdditionalImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        technologies: [...project.technologies],
        imageUrl: project.imageUrl,
        demoUrl: project.demoUrl || "",
        githubUrl: project.githubUrl || "",
        detailedDescription: project.detailedDescription || "",
        role: project.role || "",
        contribution: project.contribution || "",
        additionalImages: project.additionalImages || [],
        features: project.features || [],
        challenges: project.challenges || "",
        duration: project.duration || "",
      })
    }
  }, [project])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddTechnology = () => {
    if (technology.trim() && !formData.technologies.includes(technology.trim())) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, technology.trim()],
      }))
      setTechnology("")
    }
  }

  const handleRemoveTechnology = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }))
  }

  const handleAddFeature = () => {
    if (feature.trim() && !formData.features?.includes(feature.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...(prev.features || []), feature.trim()],
      }))
      setFeature("")
    }
  }

  const handleRemoveFeature = (feat: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features?.filter((f) => f !== feat) || [],
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAdditionalImageFile(file)

      try {
        // Upload the additional image immediately
        const imageUrl = await uploadAdditionalProjectImage(file)

        // Add the new image URL to the additionalImages array
        setFormData((prev) => ({
          ...prev,
          additionalImages: [...(prev.additionalImages || []), imageUrl],
        }))

        toast({
          title: "Success",
          description: "Additional image uploaded successfully",
        })
      } catch (error) {
        console.error("Error uploading additional image:", error)
        toast({
          title: "Error",
          description: "Failed to upload additional image",
          variant: "destructive",
        })
      } finally {
        setAdditionalImageFile(null)
      }
    }
  }

  const handleRemoveAdditionalImage = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages?.filter((img) => img !== imageUrl) || [],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let imageUrl = formData.imageUrl

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadProjectImage(imageFile)
      }

      const projectData = {
        ...formData,
        imageUrl,
      }

      let savedProject: Project

      if (project) {
        // Update existing project
        savedProject = await updateProject(project.id, projectData)
        toast({
          title: "Success",
          description: "Project updated successfully",
        })
      } else {
        // Add new project
        savedProject = await addProject(projectData)
        toast({
          title: "Success",
          description: "Project added successfully",
        })
      }

      onSave(savedProject)
    } catch (error) {
      console.error("Error saving project:", error)
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Information</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
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

          <div className="space-y-2">
            <Label>Technologies</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                placeholder="Add technology"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTechnology()
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddTechnology}>
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add</span>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.technologies.map((tech) => (
                <Badge key={tech} variant="secondary" className="gap-1">
                  {tech}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveTechnology(tech)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {tech}</span>
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Project Image</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-md border-muted-foreground/25">
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="mt-2 text-sm text-muted-foreground">Click to upload</span>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-center">
                {(imagePreview || formData.imageUrl) && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                    <img
                      src={imagePreview || formData.imageUrl}
                      alt="Project preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="demoUrl">Demo URL</Label>
              <Input
                id="demoUrl"
                name="demoUrl"
                type="url"
                placeholder="https://example.com"
                value={formData.demoUrl}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                name="githubUrl"
                type="url"
                placeholder="https://github.com/username/repo"
                value={formData.githubUrl}
                onChange={handleChange}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="detailedDescription">Detailed Description</Label>
            <Textarea
              id="detailedDescription"
              name="detailedDescription"
              rows={6}
              value={formData.detailedDescription}
              onChange={handleChange}
              placeholder="Provide a comprehensive description of the project, its purpose, and functionality."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role">Your Role</Label>
              <Input
                id="role"
                name="role"
                placeholder="e.g., Lead Developer, Frontend Engineer"
                value={formData.role}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Project Duration</Label>
              <Input
                id="duration"
                name="duration"
                placeholder="e.g., 3 months, Jan 2022 - Mar 2022"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution">Your Contribution</Label>
            <Textarea
              id="contribution"
              name="contribution"
              rows={4}
              value={formData.contribution}
              onChange={handleChange}
              placeholder="Describe your specific contributions to the project, responsibilities, and achievements."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenges">Challenges & Solutions</Label>
            <Textarea
              id="challenges"
              name="challenges"
              rows={4}
              value={formData.challenges}
              onChange={handleChange}
              placeholder="Describe the challenges you faced during the project and how you overcame them."
            />
          </div>

          <div className="space-y-2">
            <Label>Key Features</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={feature}
                onChange={(e) => setFeature(e.target.value)}
                placeholder="Add feature"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddFeature()
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddFeature}>
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add</span>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.features?.map((feat) => (
                <Badge key={feat} variant="secondary" className="gap-1">
                  {feat}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveFeature(feat)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {feat}</span>
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Additional Images</Label>
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-md border-muted-foreground/25">
                <label
                  htmlFor="additional-image-upload"
                  className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="mt-2 text-sm text-muted-foreground">Click to upload additional image</span>
                  <Input
                    id="additional-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAdditionalImageChange}
                  />
                </label>
              </div>
            </div>

            {formData.additionalImages && formData.additionalImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {formData.additionalImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video w-full overflow-hidden rounded-md border">
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={`Project image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveAdditionalImage(imageUrl)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove image</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : project ? "Update Project" : "Add Project"}
        </Button>
      </div>
    </form>
  )
}
