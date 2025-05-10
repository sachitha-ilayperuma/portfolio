import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Github, Linkedin, Mail, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProfileSection } from "@/components/profile-section"
import { ProjectsSection } from "@/components/projects-section"
import { SkillsSection } from "@/components/skills-section"
import { ExperienceSection } from "@/components/experience-section"
import { EducationSection } from "@/components/education-section"
import { InterestsSection } from "@/components/interests-section"
import { ContactSection } from "@/components/contact-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section with custom gradient using all three colors */}
      <section className="hero-gradient relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] opacity-20" />
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="container relative z-10 px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Senior Software Engineer
                </h1>
                <p className="max-w-[600px] text-white/80 md:text-xl">
                  Building innovative solutions with cutting-edge technologies. Passionate about creating efficient,
                  scalable, and user-friendly applications.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="#contact">
                  <Button className="w-full min-[400px]:w-auto bg-white text-[#020447] hover:bg-white/90">
                    Contact Me <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#projects">
                  <Button
                    variant="outline"
                    className="w-full min-[400px]:w-auto border-white text-white hover:bg-white/10 dark:text-white"
                  >
                    View Projects
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-4 text-white/80">
                <Link
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </Link>
                <Link
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
                <Link href="mailto:contact@example.com" className="hover:text-white transition-colors">
                  <Mail className="h-5 w-5" />
                  <span className="sr-only">Email</span>
                </Link>
                <Link href="tel:+1234567890" className="hover:text-white transition-colors">
                  <Phone className="h-5 w-5" />
                  <span className="sr-only">Phone</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative aspect-square w-full max-w-[400px] overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                <Suspense fallback={<Skeleton className="h-full w-full rounded-full" />}>
                  <Image
                    src="/placeholder.svg?height=400&width=400"
                    alt="Profile"
                    width={400}
                    height={400}
                    className="object-cover"
                    priority
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container px-4 py-12 md:px-6 md:py-24">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <ProfileSection />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[600px] w-full mt-12" />}>
          <ProjectsSection />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[400px] w-full mt-12" />}>
          <SkillsSection />
        </Suspense>

        {/* Experience Section with Dark Red Background */}
        <Suspense fallback={<Skeleton className="h-[500px] w-full mt-12" />}>
          <ExperienceSection />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[400px] w-full mt-12" />}>
          <EducationSection />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[300px] w-full mt-12" />}>
          <InterestsSection />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[400px] w-full mt-12" />}>
          <ContactSection />
        </Suspense>
      </div>
    </main>
  )
}
