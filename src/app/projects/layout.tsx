import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Projects | Senior Software Engineer Portfolio",
  description: "Detailed information about my projects and contributions",
}

export default function ProjectsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
