import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="py-12 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Side - Text */}
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight text-balance">
            All Your College Study Materials in One Place
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
            Access organized, verified study materials, previous year question papers, and complete syllabi for all
            subjects. Everything you need to excel in your studies.
          </p>
          <div className="flex gap-4 pt-4">
            <Link href="/browse">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Browse Study Materials
              </Button>
            </Link>
            <Link href="/exam-schedule">
              <Button size="lg" variant="outline">
                View Exam Schedule
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="flex items-center justify-center">
          <div className="relative w-full h-64 md:h-80">
            {/* Floating PDF Cards */}
            <div className="absolute top-0 left-0 w-32 h-40 rounded-lg bg-card border border-border shadow-md transform -rotate-6 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-2">📄</div>
                <p className="text-xs font-semibold text-foreground">Study Material</p>
              </div>
            </div>
            <div className="absolute top-12 right-0 w-32 h-40 rounded-lg bg-card border border-border shadow-lg transform rotate-3 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-xs font-semibold text-foreground">Question Paper</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-1/3 w-32 h-40 rounded-lg bg-card border border-border shadow-md transform rotate-6 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-2">📚</div>
                <p className="text-xs font-semibold text-foreground">Syllabus</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
