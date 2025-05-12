import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { HeroSection } from "@/components/hero-section"
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
      <HeroSection />

      {/* Main Content */}
      <div className="container px-4 py-12 md:px-6 md:py-24">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <ProfileSection />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[400px] w-full mt-12" />}>
          <SkillsSection />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[600px] w-full mt-12" />}>
          <ProjectsSection />
        </Suspense>



        
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
