import type React from "react"
import type { Metadata } from "next"


export const metadata: Metadata = {
  title: "Login",
  description: "Log In To Admin Dashboard",
}




export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}