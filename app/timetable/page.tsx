"use client"

import { useEffect, useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card } from "@/components/card-component"
import { Button } from "@/components/ui/button"
import { FileText, Calendar } from "lucide-react"
import { createClient } from "@/lib/client"

interface Timetable {
  id: number
  title: string
  description: string | null
  pdf_url: string | null
  created_at: string
}

export default function TimetablePage() {
  const supabase = createClient()

  const [timetables, setTimetables] = useState<Timetable[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTimetables = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("timetable_documents")
        .select("id, title, description, pdf_url, created_at")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching timetables:", error.message)
      } else {
        setTimetables(data || [])
      }

      setLoading(false)
    }

    fetchTimetables()
  }, [supabase])

  return (
    <LayoutWrapper breadcrumbs={[{ label: "College Timetable" }]}>
      <section className="py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            College Timetable
          </h1>
          <p className="text-lg text-muted-foreground">
            View class schedules and timetables for all departments
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading timetables...
          </div>
        ) : timetables.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No timetables available.
          </div>
        ) : (
          <div className="space-y-3">
            {timetables.map((timetable) => (
              <Card key={timetable.id} hoverable className="py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">
                        {timetable.title}
                      </h3>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {new Date(timetable.created_at).toDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {timetable.pdf_url && (
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 flex-shrink-0"
                      onClick={() => window.open(timetable.pdf_url!, "_blank")}
                    >
                      View PDF
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </LayoutWrapper>
  )
}
