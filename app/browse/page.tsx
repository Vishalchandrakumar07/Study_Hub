"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card } from "@/components/card-component"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/client"

interface Category {
  id: number
  name: string
  description?: string | null
}

export default function BrowsePage() {
  const supabase = createClient()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("categories")
        .select("id, name, description")
        .order("name", { ascending: true })

      if (!error && data) {
        setCategories(data)
      }

      setLoading(false)
    }

    fetchCategories()
  }, [supabase])

  return (
    <LayoutWrapper breadcrumbs={[{ label: "Browse Materials" }]}>
      {/* Browse by Category */}
      <section className="py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Browse by Category
          </h1>
          <p className="text-muted-foreground">
            Select a category to explore all departments and programs
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading categories...
          </div>
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
                    <h3 className="text-lg font-semibold text-foreground">
                      {category.name}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {category.description || "Browse departments and programs"}
                    </p>

                    <div className="pt-2 border-t border-border">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                      >
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
    </LayoutWrapper>
  )
}
