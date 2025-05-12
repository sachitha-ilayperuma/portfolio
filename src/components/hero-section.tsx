"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Github, Linkedin, Mail, Phone } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/animations/fade-in"
import { ScaleIn } from "@/components/animations/scale-in"
import { fetchProfile } from "@/lib/firebase/profile"
import { Skeleton } from "@/components/ui/skeleton"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [profileData, setProfileData] = useState<{
    name: string
    title: string
    imageUrl: string
    email: string
    phone: string
    github: string
    linkedin: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setMounted(true)

    const loadProfileData = async () => {
      try {
        const profile = await fetchProfile()
        setProfileData({
          name: profile.name,
          title: profile.title,
          imageUrl: profile.imageUrl,
          email: profile.email,
          phone: profile.phone,
          github: profile.github,
          linkedin: profile.linkedin,
        })
      } catch (error) {
        console.error("Error loading profile data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfileData()
  }, [])

  if (!mounted) return null

  return (
    <section className="hero-gradient relative min-h-[90vh] flex items-center justify-center overflow-hidden lg:pb-0 pb-10">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] opacity-20" />
      <motion.div
        className="absolute pointer-events-none inset-0 flex items-center justify-center"
        style={{
          maskImage: "radial-gradient(ellipse at center, transparent 20%, black)",
          WebkitMaskImage: "radial-gradient(ellipse at center, transparent 20%, black)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />
      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <FadeIn delay={0.2} direction="up">
              <div className="space-y-2 mt-32 lg:mt-0">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  {isLoading ? <Skeleton className="h-12 w-3/4" /> : profileData?.name || "Senior Software Engineer"}
                </h1>
                <p className="max-w-[600px] text-white/80 md:text-xl">
                  Building innovative solutions with cutting-edge technologies. Passionate about creating efficient,
                  scalable, and user-friendly applications.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.4} direction="up">
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="#contact">
                  <Button className="w-full min-[400px]:w-auto bg-white text-[#020447] hover:bg-white/90">
                    Contact Me <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#projects">
                  <Button
                    variant="outline"
                    className="w-full min-[400px]:w-auto border-white text-black hover:bg-white/10 dark:text-white"
                  >
                    View Projects
                  </Button>
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.6} direction="up">
              <div className="flex items-center gap-4 text-white/80">
                {isLoading ? (
                  <>
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </>
                ) : (
                  <>
                    {profileData?.github && (
                      <Link
                        href={profileData.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        <Github className="h-5 w-5" />
                        <span className="sr-only">GitHub</span>
                      </Link>
                    )}
                    {profileData?.linkedin && (
                      <Link
                        href={profileData.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                        <span className="sr-only">LinkedIn</span>
                      </Link>
                    )}
                    {profileData?.email && (
                      <Link href={`mailto:${profileData.email}`} className="hover:text-white transition-colors">
                        <Mail className="h-5 w-5" />
                        <span className="sr-only">Email</span>
                      </Link>
                    )}
                    {profileData?.phone && (
                      <Link href={`tel:${profileData.phone}`} className="hover:text-white transition-colors">
                        <Phone className="h-5 w-5" />
                        <span className="sr-only">Phone</span>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </FadeIn>
          </div>
          <ScaleIn delay={0.3} duration={1.2}>
            <div className="flex items-center justify-center">
              <div className="relative aspect-square w-full max-w-[400px] overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                {isLoading ? (
                  <Skeleton className="h-full w-full rounded-full" />
                ) : (
                  <Image
                    src={profileData?.imageUrl || "/placeholder.svg?height=400&width=400"}
                    alt="Profile"
                    width={400}
                    height={400}
                    className="object-cover"
                    priority
                  />
                )}
              </div>
            </div>
          </ScaleIn>
        </div>
      </div>
    </section>
  )
}
