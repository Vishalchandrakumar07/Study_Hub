import Link from "next/link"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card } from "@/components/card-component"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/client"

interface DepartmentPageProps {
  params: Promise<{ id: string }>
}

export default async function DepartmentPage({ params }: DepartmentPageProps) {
  const { id } = await params
  const supabase = createClient()

  // 1️⃣ Fetch department
  const { data: department, error: deptError } = await supabase
    .from("departments")
    .select("id, name, category_id")
    .eq("id", Number(id))
    .single()

  if (!department || deptError) {
    return (
      <LayoutWrapper>
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">Department not found</p>
        </div>
      </LayoutWrapper>
    )
  }

  // 2️⃣ Fetch category name
  const { data: category } = await supabase
    .from("categories")
    .select("id, name")
    .eq("id", department.category_id)
    .single()

  // 3️⃣ Fetch years belonging to this department
  const { data: years } = await supabase
    .from("years")
    .select("id, year_number")
    .eq("department_id", Number(id))
    .order("year_number", { ascending: true })

  return (
    <LayoutWrapper
      breadcrumbs={[
        { label: "Browse", href: "/browse" },
        { label: category?.name ?? "Category", href: `/category/${department.category_id}` },
        { label: department.name },
      ]}
    >
      <section className="py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{department.name}</h1>
          <p className="text-lg text-muted-foreground">Select a year to view semesters</p>
        </div>

        {!years?.length && (
          <p className="text-muted-foreground">No years found for this department.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {years?.map((year) => (
            <Link key={year.id} href={`/year/${department.id}-${year.id}`}>
              <Card hoverable>
                <div className="flex flex-col gap-4 text-center">
                  <div className="text-4xl font-bold text-primary">Year {year.year_number}</div>
                  <p className="text-sm text-muted-foreground">View semesters and subjects</p>
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                    Explore
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
