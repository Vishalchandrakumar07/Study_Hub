import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card } from "@/components/card-component"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, Tag } from "lucide-react"

export default function ExamSchedulePage() {
  const schedules = [
    {
      id: 1,
      title: "Mid Semester Exam Schedule - December 2024",
      tags: ["Engineering", "All Years"],
      date: "Oct 15, 2024",
    },
    {
      id: 2,
      title: "End Semester Exam Schedule - January 2025",
      tags: ["Engineering", "All Years"],
      date: "Oct 20, 2024",
    },
    {
      id: 3,
      title: "Science Department Exam Schedule",
      tags: ["Science", "All Years"],
      date: "Oct 18, 2024",
    },
    {
      id: 4,
      title: "Commerce Department Exam Schedule",
      tags: ["Commerce", "All Years"],
      date: "Oct 22, 2024",
    },
    {
      id: 5,
      title: "Arts Department Exam Schedule",
      tags: ["Arts", "All Years"],
      date: "Oct 25, 2024",
    },
    {
      id: 6,
      title: "Supplementary Exam Schedule",
      tags: ["All Departments"],
      date: "Oct 28, 2024",
    },
  ]

  return (
    <LayoutWrapper breadcrumbs={[{ label: "Exam Schedule" }]}>
      <section className="py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Exam Schedule</h1>
          <p className="text-lg text-muted-foreground">Download exam schedules for all departments and years</p>
        </div>

        <div className="space-y-3">
          {schedules.map((schedule) => (
            <Card key={schedule.id} hoverable className="py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">{schedule.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {schedule.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 bg-secondary/50 text-foreground px-2 py-1 rounded text-xs"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{schedule.date}</p>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="bg-primary hover:bg-primary/90 flex-shrink-0">
                  View PDF
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </LayoutWrapper>
  )
}
