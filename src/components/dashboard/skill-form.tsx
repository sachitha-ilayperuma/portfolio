"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { addSkill, updateSkill } from "@/lib/firebase/skills"
import { uploadSkillIcon } from "@/lib/firebase/storage"
import {
  Code,
  Database,
  Server,
  Globe,
  Cpu,
  GitBranch,
  Layers,
  Workflow,
  BrainCircuit,
  Users,
  Cloud,
  Terminal,
  Laptop,
  Smartphone,
  Zap,
  FileCode,
  Puzzle,
  PenToolIcon as Tool,
  Wrench,
  Settings,
  Upload,
  X,
  ImageIcon,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Skill {
  id: string
  name: string
  category: string
  icon?: string
  iconUrl?: string
}

interface SkillFormProps {
  skill: Skill | null
  onSave: (skill: Skill) => void
  onCancel: () => void
}

// Define available icons
const availableIcons = [
  { name: "Code", component: Code },
  { name: "Database", component: Database },
  { name: "Server", component: Server },
  { name: "Globe", component: Globe },
  { name: "Cpu", component: Cpu },
  { name: "GitBranch", component: GitBranch },
  { name: "Layers", component: Layers },
  { name: "Workflow", component: Workflow },
  { name: "BrainCircuit", component: BrainCircuit },
  { name: "Users", component: Users },
  { name: "Cloud", component: Cloud },
  { name: "Terminal", component: Terminal },
  { name: "Laptop", component: Laptop },
  { name: "Smartphone", component: Smartphone },
  { name: "Zap", component: Zap },
  { name: "FileCode", component: FileCode },
  { name: "Puzzle", component: Puzzle },
  { name: "Tool", component: Tool },
  { name: "Wrench", component: Wrench },
  { name: "Settings", component: Settings },
]

export function SkillForm({ skill, onSave, onCancel }: SkillFormProps) {
  const [formData, setFormData] = useState<Omit<Skill, "id">>({
    name: "",
    category: "",
    icon: "",
    iconUrl: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [iconTab, setIconTab] = useState<string>("builtin")
  const { toast } = useToast()

  useEffect(() => {
    if (skill) {
      setFormData({
        name: skill.name,
        category: skill.category,
        icon: skill.icon || "",
        iconUrl: skill.iconUrl || "",
      })

      // Set the active tab based on which icon type is present
      if (skill.iconUrl) {
        setIconTab("custom")
      } else {
        setIconTab("builtin")
      }
    }
  }, [skill])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleIconChange = (value: string) => {
    setFormData((prev) => ({ ...prev, icon: value }))
  }

  const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setIconFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setIconPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearCustomIcon = () => {
    setIconFile(null)
    setIconPreview(null)
    setFormData((prev) => ({ ...prev, iconUrl: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updatedFormData = { ...formData }

      // Handle icon upload if a new file is selected
      if (iconFile && iconTab === "custom") {
        try {
          const iconUrl = await uploadSkillIcon(iconFile)
          updatedFormData.iconUrl = iconUrl
          // Clear the built-in icon if using a custom one
          updatedFormData.icon = ""
        } catch (error) {
          console.error("Error uploading icon:", error)
          toast({
            title: "Error",
            description: "Failed to upload custom icon",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      } else if (iconTab === "builtin") {
        // If using built-in icon, clear any custom icon URL
        updatedFormData.iconUrl = ""
      }

      let savedSkill: Skill

      if (skill) {
        // Update existing skill
        savedSkill = await updateSkill(skill.id, updatedFormData)
        toast({
          title: "Success",
          description: "Skill updated successfully",
        })
      } else {
        // Add new skill
        savedSkill = await addSkill(updatedFormData)
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

  // Get the selected icon component
  const SelectedIcon = availableIcons.find((icon) => icon.name === formData.icon)?.component

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

      <div className="space-y-2">
        <Label>Icon</Label>
        <Tabs value={iconTab} onValueChange={setIconTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="builtin">Built-in Icon</TabsTrigger>
            <TabsTrigger value="custom">Custom Icon</TabsTrigger>
          </TabsList>

          <TabsContent value="builtin" className="space-y-4 pt-4">
            <Select value={formData.icon} onValueChange={handleIconChange}>
              <SelectTrigger id="icon" className="w-full">
                <SelectValue placeholder="Select an icon">
                  {SelectedIcon ? (
                    <div className="flex items-center">
                      <SelectedIcon className="mr-2 h-4 w-4" />
                      <span>{formData.icon}</span>
                    </div>
                  ) : (
                    "Select an icon"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-72">
                  {availableIcons.map((icon) => (
                    <SelectItem key={icon.name} value={icon.name} className="flex items-center">
                      <div className="flex items-center">
                        <icon.component className="mr-2 h-4 w-4" />
                        <span>{icon.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>

            {SelectedIcon && (
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <SelectedIcon className="h-8 w-8 text-primary" />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-md border-muted-foreground/25">
                  <label
                    htmlFor="icon-upload"
                    className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="mt-2 text-sm text-muted-foreground">Click to upload icon</span>
                    <span className="text-xs text-muted-foreground">(SVG, PNG, or JPG)</span>
                    <Input
                      id="icon-upload"
                      type="file"
                      accept="image/svg+xml,image/png,image/jpeg"
                      className="hidden"
                      onChange={handleIconFileChange}
                    />
                  </label>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                {(iconPreview || formData.iconUrl) && (
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                      <img
                        src={iconPreview || formData.iconUrl}
                        alt="Icon preview"
                        className="h-10 w-10 object-contain"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={clearCustomIcon}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove icon</span>
                    </Button>
                  </div>
                )}
                {!iconPreview && !formData.iconUrl && (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <span className="text-sm">No custom icon</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
