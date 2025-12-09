"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Download, Trash2 } from "lucide-react"
import { Card } from "@/components/card-component"
import { createClient } from "@/lib/client"

interface Semester {
  id: number
  semester_number: number
}

interface ExamSchedule {
  id: number
  title: string
  description: string | null
  pdf_url: string | null
  semester_id: number | null
  created_at: string
}

export default function ExamSchedulePage() {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSemester, setSelectedSemester] = useState<number | "">("")
  const [showForm, setShowForm] = useState(false)
  const [newSchedule, setNewSchedule] = useState({
    title: "",
    description: "",
    pdf_file: null as File | null,
  })
  const supabase = createClient()

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [semestersRes, schedulesRes] = await Promise.all([
        supabase.from("semesters").select("id, semester_number").order("semester_number"),
        supabase.from("exam_schedules").select("*").order("created_at", { ascending: false }),
      ])

      if (semestersRes.data) setSemesters(semestersRes.data)
      if (schedulesRes.data) setSchedules(schedulesRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSchedule.title.trim() || !selectedSemester) return

    setUploading(true)
    try {
      let pdfUrl = null

      if (newSchedule.pdf_file) {
        const fileName = `exam-schedule/${Number(selectedSemester)}/${Date.now()}-${newSchedule.pdf_file.name}`

        const { error: uploadError } = await supabase.storage.from("materials").upload(fileName, newSchedule.pdf_file)

        if (uploadError) throw uploadError

        const { data: publicData } = supabase.storage.from("materials").getPublicUrl(fileName)
        pdfUrl = publicData.publicUrl
      }

      const { error } = await supabase.from("exam_schedules").insert([
        {
          title: newSchedule.title,
          description: newSchedule.description,
          pdf_url: pdfUrl,
          semester_id: Number(selectedSemester),
        },
      ])

      if (error) throw error
      setNewSchedule({ title: "", description: "", pdf_file: null })
      setSelectedSemester("")
      setShowForm(false)
      fetchAllData()
    } catch (error) {
      console.error("Error adding schedule:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteSchedule = async (id: number) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return

    try {
      const { error } = await supabase.from("exam_schedules").delete().eq("id", id)
      if (error) throw error
      fetchAllData()
    } catch (error) {
      console.error("Error deleting schedule:", error)
    }
  }

  const filteredSchedules = schedules.filter((schedule) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = schedule.title.toLowerCase().includes(searchLower)
    const matchesSemester = !selectedSemester || schedule.semester_id === Number(selectedSemester)
    return matchesSearch && matchesSemester
  })

  if (loading) return <div className="text-center py-8">Loading exam schedules...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Exam Schedule</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Schedule
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleAddSchedule} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              >
                <option value="">Select Semester</option>
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>
                    Semester {sem.semester_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Title</label>
              <input
                type="text"
                value={newSchedule.title}
                onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                placeholder="e.g., Mid Semester Exam - December 2024"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={newSchedule.description}
                onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                placeholder="Schedule description"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Upload PDF</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setNewSchedule({ ...newSchedule, pdf_file: e.target.files?.[0] || null })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {newSchedule.pdf_file && <p className="text-sm text-primary mt-2">File: {newSchedule.pdf_file.name}</p>}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={uploading} className="bg-primary hover:bg-primary/90">
                {uploading ? "Uploading..." : "Add Schedule"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="bg-transparent">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value === "" ? "" : Number(e.target.value))}
          className="rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Semesters</option>
          {semesters.map((sem) => (
            <option key={sem.id} value={sem.id}>
              Semester {sem.semester_number}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-foreground">Title</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Semester</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 px-4 text-center text-muted-foreground">
                  No schedules found.
                </td>
              </tr>
            ) : (
              filteredSchedules.map((schedule) => {
                const semester = semesters.find((s) => s.id === schedule.semester_id)
                return (
                  <tr key={schedule.id} className="border-b border-border hover:bg-secondary/20">
                    <td className="py-3 px-4 text-foreground">{schedule.title}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {semester ? `Semester ${semester.semester_number}` : "-"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">
                      {new Date(schedule.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {schedule.pdf_url && (
                          <a href={schedule.pdf_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="bg-transparent">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent text-destructive hover:text-destructive"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
