import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-provider"
import { ScrollProgress } from "@/components/scroll-progress"

// Import Firebase config to ensure it's initialized at the app root
import "@/lib/firebase/config"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sachitha Ilayperuma",
  description: "I'm a passionate web developer specializing in building responsive and user-friendly applications using React, Next.js, and Firebase. Explore my work and journey as I craft digital experiences with performance and design in mind.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
            storageKey="portfolio-theme"
          >
            <ScrollProgress />
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
