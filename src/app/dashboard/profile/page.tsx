"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { fetchProfile, updateProfile, uploadProfileImage } from "@/lib/firebase/profile"

interface Profile {
  name: string
  title: string
  bio: string
  email: string
  phone: string
  location: string
  github: string
  linkedin: string
  website: string
  imageUrl: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    title: "",
    bio: "",
    email: "",
    phone: "",
    location: "",
    github: "",
    linkedin: "",
    website: "",
    imageUrl: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await fetchProfile()
        setProfile(profileData)
      } catch (error) {
        console.error("Error loading profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      let imageUrl = profile.imageUrl

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadProfileImage(imageFile)
      }

      // Update profile with new data
      await updateProfile({
        ...profile,
        imageUrl,
      })

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })

      // Reset image state
      setImageFile(null)
      setImagePreview(null)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
          <Card>
            <CardHeader>
              <CardTitle>Profile Image</CardTitle>
              <CardDescription>Update your profile picture</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="relative mb-4 h-40 w-40 overflow-hidden rounded-full">
                <img
                  src={imagePreview || profile.imageUrl || "/placeholder.svg?height=160&width=160"}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
                <label
                  htmlFor="profile-image"
                  className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground"
                >
                  <Camera className="h-5 w-5" />
                  <span className="sr-only">Change profile picture</span>
                </label>
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" value={profile.name} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Professional Title</Label>
                    <Input id="title" name="title" value={profile.title} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" name="bio" rows={4} value={profile.bio} onChange={handleChange} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Update your contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={profile.email} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" value={profile.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" value={profile.location} onChange={handleChange} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Update your social media profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      name="github"
                      value={profile.github}
                      onChange={handleChange}
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      name="linkedin"
                      value={profile.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Personal Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={profile.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving} className="ml-auto">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
