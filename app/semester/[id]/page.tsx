import Link from "next/link"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card } from "@/components/card-component"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { createClient } from "@/lib/server"

interface SemesterPageProps {
  params: Promise<{ id: string }>
}

export default async function SemesterPage({ params }: SemesterPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Format: deptId-yearId-semesterId
  const [departmentId, yearId, semesterId] = id.split("-").map(Number)

  // 1️⃣ Fetch Department
  const { data: department } = await supabase
  .from("departments")
  .select("id, name")
  .eq("id", departmentId)
  .single()

  // 2️⃣ Fetch Year
  const { data: year } = await supabase
    .from("years")
    .select("id, year_number")
    .eq("id", yearId)
    .single()

  // 3️⃣ Fetch Semester
  const { data: semester } = await supabase
    .from("semesters")
    .select("id, semester_number")
    .eq("id", semesterId)
    .single()

  // 4️⃣ Fetch Subjects for this semester
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name, code, credits")
    .eq("semester_id", semesterId)
    .order("code", { ascending: true })

  if (!department || !year || !semester) {
    return (
      <LayoutWrapper>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Invalid semester</p>
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper
      breadcrumbs={[
        { label: "Browse", href: "/browse" },
        { label: department.name, href: `/department/${departmentId}` },
        { label: `Year ${year.year_number}`, href: `/year/${departmentId}-${yearId}` },
        { label: `Semester ${semester.semester_number}` },
      ]}
    >
      <section className="py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {department.name} — Year {year.year_number}, Semester {semester.semester_number}
          </h1>
          <p className="text-lg text-muted-foreground">Select a subject to view study materials</p>
        </div>

        {!subjects?.length ? (
          <p className="text-muted-foreground">No subjects found for this semester.</p>
        ) : (
          <div className="space-y-3">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/subject/${departmentId}-${yearId}-${semesterId}-${subject.id}`}
              >
                <Card hoverable className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-primary mb-1">{subject.code}</p>
                      <h3 className="text-lg font-semibold">{subject.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {subject.credits ?? "-"} Credits
                      </p>
                    </div>

                    <Button size="sm" variant="ghost">
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </Button>
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
