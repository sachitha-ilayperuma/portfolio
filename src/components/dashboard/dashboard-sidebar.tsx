"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Layers, LogOut, Settings, User, Briefcase, GraduationCap, Heart, Code } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-hooks"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          Portfolio Admin
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
              <Link href="/dashboard">
                <BarChart3 />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/profile")}>
              <Link href="/dashboard/profile">
                <User />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/projects")}>
              <Link href="/dashboard/projects">
                <Layers />
                <span>Projects</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/skills")}>
              <Link href="/dashboard/skills">
                <Code />
                <span>Skills</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/experience")}>
              <Link href="/dashboard/experience">
                <Briefcase />
                <span>Experience</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/education")}>
              <Link href="/dashboard/education">
                <GraduationCap />
                <span>Education</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/interests")}>
              <Link href="/dashboard/interests">
                <Heart />
                <span>Interests</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/settings")}>
              <Link href="/dashboard/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button variant="outline" className="w-full justify-start" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
