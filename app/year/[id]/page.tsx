import Link from "next/link"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card } from "@/components/card-component"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/client"

interface YearPageProps {
  params: Promise<{ id: string }>
}

export default async function YearPage({ params }: YearPageProps) {
  const { id } = await params
  const supabase = createClient()

  // id is formatted as "departmentId-yearId"
  const [departmentId, yearId] = id.split("-").map(Number)

  // 1️⃣ Fetch year details
  const { data: year, error: yearError } = await supabase
    .from("years")
    .select("id, year_number, department_id")
    .eq("id", yearId)
    .single()

  if (!year || yearError) {
    return (
      <LayoutWrapper>
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">Year not found</p>
        </div>
      </LayoutWrapper>
    )
  }

  // 2️⃣ Fetch department details
  const { data: department } = await supabase
    .from("departments")
    .select("id, name, category_id")
    .eq("id", departmentId)
    .single()

  // 3️⃣ Fetch semesters for this year
  const { data: semesters } = await supabase
    .from("semesters")
    .select("id, semester_number")
    .eq("year_id", yearId)
    .order("semester_number", { ascending: true })

  return (
    <LayoutWrapper
      breadcrumbs={[
        { label: "Browse", href: "/browse" },
        { label: department?.name ?? "Department", href: `/department/${departmentId}` },
        { label: `Year ${year.year_number}` },
      ]}
    >
      <section className="py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {department?.name} – Year {year.year_number}
          </h1>
          <p className="text-lg text-muted-foreground">Select a semester to view subjects</p>
        </div>

        {!semesters?.length && (
          <p className="text-muted-foreground">No semesters found for this year.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {semesters?.map((semester) => (
            <Link
              key={semester.id}
              href={`/semester/${departmentId}-${yearId}-${semester.id}`}
            >
              <Card hoverable>
                <div className="flex flex-col gap-4">
                  <div className="text-3xl font-bold text-primary">
                    Semester {semester.semester_number}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Click to view all subjects in this semester
                  </p>
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                    View Subjects
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
