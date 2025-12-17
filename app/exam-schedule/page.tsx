"use client"

import { useEffect, useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card } from "@/components/card-component"
import { Button } from "@/components/ui/button"
import { FileText, Calendar } from "lucide-react"
import { createClient } from "@/lib/client"

interface ExamSchedule {
  id: number
  title: string
  description: string | null
  pdf_url: string | null
  created_at: string
}

export default function ExamSchedulePage() {
  const supabase = createClient()
  const [schedules, setSchedules] = useState<ExamSchedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("exam_schedules")
        .select("id, title, description, pdf_url, created_at")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching schedules:", error.message)
      } else {
        setSchedules(data || [])
      }

      setLoading(false)
    }

    fetchSchedules()
  }, [supabase])

  return (
    <LayoutWrapper breadcrumbs={[{ label: "Exam Schedule" }]}>
      <section className="py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Exam Schedule</h1>
          <p className="text-muted-foreground">
            Download exam schedules for all departments and years
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading exam schedules...
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No exam schedules available.
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <Card key={schedule.id} hoverable className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>

                    <div>
                      <h3 className="font-semibold">{schedule.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {new Date(schedule.created_at).toDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {schedule.pdf_url && (
                    <Button
                      size="sm"
                      onClick={() => window.open(schedule.pdf_url!, "_blank")}
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
