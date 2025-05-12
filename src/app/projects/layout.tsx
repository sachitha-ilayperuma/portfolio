import type React from "react"
import type { Metadata } from "next"
import { fetchProjects } from "@/lib/firebase/projects"

export const metadata: Metadata = {
  title: "Projects | Senior Software Engineer Portfolio",
  description: "Detailed information about my projects and contributions",
}

export async function generateStaticParams() {
  const projects = await fetchProjects()

  return projects.map((project) => ({
    id: project.id,
  }))
}


export default function ProjectsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
