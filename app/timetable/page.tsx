import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card } from "@/components/card-component"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, Tag } from "lucide-react"

export default function TimetablePage() {
  const timetables = [
    {
      id: 1,
      title: "Engineering Department Timetable - Semester 1",
      tags: ["Engineering", "Year 1-4"],
      date: "Sep 10, 2024",
    },
    {
      id: 2,
      title: "Science Department Timetable",
      tags: ["Science", "Year 1-3"],
      date: "Sep 12, 2024",
    },
    {
      id: 3,
      title: "Commerce Department Timetable",
      tags: ["Commerce", "Year 1-3"],
      date: "Sep 15, 2024",
    },
    {
      id: 4,
      title: "Arts Department Timetable",
      tags: ["Arts", "Year 1-3"],
      date: "Sep 18, 2024",
    },
    {
      id: 5,
      title: "Lab Schedule - Engineering CSE",
      tags: ["Engineering", "Computer Science"],
      date: "Sep 20, 2024",
    },
    {
      id: 6,
      title: "Practical Schedule - Science",
      tags: ["Science", "All Departments"],
      date: "Sep 22, 2024",
    },
  ]

  return (
    <LayoutWrapper breadcrumbs={[{ label: "College Timetable" }]}>
      <section className="py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">College Timetable</h1>
          <p className="text-lg text-muted-foreground">View class schedules and timetables for all departments</p>
        </div>

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
                    <h3 className="font-semibold text-foreground mb-2">{timetable.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {timetable.tags.map((tag, idx) => (
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
                      <p className="text-xs text-muted-foreground">{timetable.date}</p>
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
