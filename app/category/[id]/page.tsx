import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card } from "@/components/card-component"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/client" // ✅ FIXED

interface CategoryPageProps {
  params: Promise<{ id: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params

  const supabase = createClient() // ✅ FIXED

  // Fetch category
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", Number(id))
    .single()

  if (!category) {
    return (
      <LayoutWrapper>
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">Category not found</p>
        </div>
      </LayoutWrapper>
    )
  }

  // Fetch departments for this category
  const { data: departments } = await supabase
    .from("departments")
    .select("*")
    .eq("category_id", Number(id))
    .order("name", { ascending: true })

  return (
    <LayoutWrapper breadcrumbs={[{ label: "Browse", href: "/browse" }, { label: category.name }]}>
      <section className="py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{category.name}</h1>
          <p className="text-lg text-muted-foreground">Select a department to view years</p>
        </div>

        {!departments?.length && (
          <p className="text-center text-muted-foreground">No departments found for this category.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments?.map((dept) => (
            <Link key={dept.id} href={`/department/${dept.id}`}>
              <Card hoverable>
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Department</p>
                    <h2 className="text-2xl font-bold text-foreground">{dept.name}</h2>
                  </div>

                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90 flex items-center justify-between">
                    View Years <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </LayoutWrapper>
  )
}
