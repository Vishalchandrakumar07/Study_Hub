"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { HeroSection } from "@/components/hero-section"
import { Card } from "@/components/card-component"
import { createClient } from "@/lib/client"

interface Category {
  id: number
  name: string
  description: string | null
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, description")
          .order("created_at", { ascending: false })

        if (error) throw error
        setCategories(data || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const highlights = [
    {
      title: "Organized by Department & Year",
      description: "Structured navigation through all programs and academic levels",
      icon: "🗂️",
    },
    {
      title: "Verified Study Materials",
      description: "All materials are curated and verified for accuracy and relevance",
      icon: "✓",
    },
    {
      title: "Previous Year Papers",
      description: "Practice with authentic past examination papers and solutions",
      icon: "📝",
    },
    {
      title: "Easy PDF Access",
      description: "One-click access to all study materials in PDF format",
      icon: "📄",
    },
  ]

  return (
    <LayoutWrapper>
      {/* Hero Section */}
      <HeroSection />

      {/* Quick Search */}
      <section className="py-8">
        <div className="relative">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-3 shadow-sm">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by subject code or name..."
              className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Browse by Category</h2>
          <p className="text-muted-foreground">Select a category to explore all departments and programs</p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No categories available. Add some from the admin panel.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.id}`}>
                <Card hoverable className="h-full">
                  <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description || "Browse departments and programs"}
                    </p>
                    <div className="pt-2 border-t border-border">
                      <Button size="sm" className="w-full mt-2 bg-transparent" variant="outline">
                        View Departments
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Highlights Section */}
      <section className="py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Why Choose Us</h2>
          <p className="text-muted-foreground">Everything you need for academic success</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((highlight, idx) => (
            <Card key={idx} className="bg-card/50">
              <div className="flex flex-col gap-4">
                <div className="text-4xl">{highlight.icon}</div>
                <h3 className="font-semibold text-foreground">{highlight.title}</h3>
                <p className="text-sm text-muted-foreground">{highlight.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 mb-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Quick Links</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/exam-schedule">
            <Card hoverable className="h-full bg-gradient-to-br from-primary/5 to-transparent">
              <h3 className="text-lg font-semibold text-foreground mb-2">Exam Schedule</h3>
              <p className="text-sm text-muted-foreground mb-4">View upcoming exam dates and schedules</p>
              <Button size="sm" variant="outline" className="w-full bg-transparent">
                View Schedules
              </Button>
            </Card>
          </Link>

          <Link href="/timetable">
            <Card hoverable className="h-full bg-gradient-to-br from-primary/5 to-transparent">
              <h3 className="text-lg font-semibold text-foreground mb-2">College Timetable</h3>
              <p className="text-sm text-muted-foreground mb-4">Check class schedules and timings</p>
              <Button size="sm" variant="outline" className="w-full bg-transparent">
                View Timetables
              </Button>
            </Card>
          </Link>

          <Link href="/browse">
            <Card hoverable className="h-full bg-gradient-to-br from-primary/5 to-transparent">
              <h3 className="text-lg font-semibold text-foreground mb-2">All Materials</h3>
              <p className="text-sm text-muted-foreground mb-4">Browse all available study materials</p>
              <Button size="sm" variant="outline" className="w-full bg-transparent">
                Browse All
              </Button>
            </Card>
          </Link>
        </div>
      </section>
    </LayoutWrapper>
  )
}
