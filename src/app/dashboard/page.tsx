"use client"

import { useEffect, useState } from "react"
import { Activity, Eye, EyeOff, FileText, Layers, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { fetchVisibleSections, updateSectionVisibility } from "@/lib/firebase/sections"

interface SectionVisibility {
  id: string
  name: string
  visible: boolean
}

export default function DashboardPage() {
  const [sections, setSections] = useState<SectionVisibility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    experience: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    const loadSections = async () => {
      try {
        const sectionsData = await fetchVisibleSections()
        setSections(sectionsData)

        // Fetch stats (in a real app, you'd have separate functions for these)
        setStats({
          projects: 8,
          skills: 15,
          experience: 4,
        })
      } catch (error) {
        console.error("Error loading sections:", error)
        toast({
          title: "Error",
          description: "Failed to load section visibility settings",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSections()
  }, [toast])

  const toggleSectionVisibility = async (sectionId: string) => {
    try {
      const section = sections.find((s) => s.id === sectionId)
      if (!section) return

      const updatedSections = sections.map((s) => (s.id === sectionId ? { ...s, visible: !s.visible } : s))
      setSections(updatedSections)

      await updateSectionVisibility(sectionId, !section.visible)

      toast({
        title: "Success",
        description: `${section.name} section is now ${!section.visible ? "visible" : "hidden"}`,
      })
    } catch (error) {
      console.error("Error toggling section visibility:", error)
      toast({
        title: "Error",
        description: "Failed to update section visibility",
        variant: "destructive",
      })

      // Revert the UI change
      const originalSections = await fetchVisibleSections()
      setSections(originalSections)
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
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visibility">Section Visibility</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.projects}</div>
                <p className="text-xs text-muted-foreground">Showcasing your best work</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Skills</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.skills}</div>
                <p className="text-xs text-muted-foreground">Technical competencies</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Work Experience</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.experience}</div>
                <p className="text-xs text-muted-foreground">Professional positions</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
              <CardDescription>Your latest portfolio changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Added new project: E-commerce Platform</p>
                    <p className="text-sm text-muted-foreground">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Updated skills: Added TypeScript</p>
                    <p className="text-sm text-muted-foreground">5 days ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Updated profile information</p>
                    <p className="text-sm text-muted-foreground">1 week ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Section Visibility</CardTitle>
              <CardDescription>Control which sections are visible on your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section.id} className="flex items-center justify-between">
                    <div className="font-medium">{section.name}</div>
                    <Button variant="outline" size="sm" onClick={() => toggleSectionVisibility(section.id)}>
                      {section.visible ? (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Visible
                        </>
                      ) : (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Hidden
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
