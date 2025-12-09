"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { Card } from "@/components/card-component"
import { createClient } from "@/lib/client"

interface Semester {
  id: number
  semester_number: number
  year_id: number | null
}

interface Year {
  id: number
  year_number: number
}

export default function SemestersPage() {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [years, setYears] = useState<Year[]>([])
  const [loading, setLoading] = useState(true)
  const [newSemester, setNewSemester] = useState({ semester_number: "", year_id: "" })
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    Promise.all([fetchSemesters(), fetchYears()])
  }, [])

  const fetchSemesters = async () => {
    try {
      const { data, error } = await supabase.from("semesters").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setSemesters(data || [])
    } catch (error) {
      console.error("Error fetching semesters:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchYears = async () => {
    try {
      const { data, error } = await supabase.from("years").select("id, year_number")
      if (error) throw error
      setYears(data || [])
    } catch (error) {
      console.error("Error fetching years:", error)
    }
  }

  const handleAddSemester = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSemester.semester_number || !newSemester.year_id) return

    try {
      const { error } = await supabase.from("semesters").insert([
        {
          semester_number: Number.parseInt(newSemester.semester_number),
          year_id: Number.parseInt(newSemester.year_id),
        },
      ])

      if (error) throw error
      setNewSemester({ semester_number: "", year_id: "" })
      setShowForm(false)
      fetchSemesters()
    } catch (error) {
      console.error("Error adding semester:", error)
    }
  }

  const handleDeleteSemester = async (id: number) => {
    if (!confirm("Are you sure you want to delete this semester?")) return

    try {
      const { error } = await supabase.from("semesters").delete().eq("id", id)
      if (error) throw error
      fetchSemesters()
    } catch (error) {
      console.error("Error deleting semester:", error)
    }
  }

  if (loading) return <div className="text-center py-8">Loading semesters...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Semesters</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Semester
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleAddSemester} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Semester Number</label>
                <select
                  value={newSemester.semester_number}
                  onChange={(e) => setNewSemester({ ...newSemester, semester_number: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="">Select semester</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Year</label>
                <select
                  value={newSemester.year_id}
                  onChange={(e) => setNewSemester({ ...newSemester, year_id: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="">Select year</option>
                  {years.map((year) => (
                    <option key={year.id} value={year.id.toString()}>
                      Year {year.year_number}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Add Semester
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="bg-transparent">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-foreground">Semester</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Year</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {semesters.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 px-4 text-center text-muted-foreground">
                  No semesters found. Add one to get started!
                </td>
              </tr>
            ) : (
              semesters.map((sem) => (
                <tr key={sem.id} className="border-b border-border hover:bg-secondary/20">
                  <td className="py-3 px-4 text-foreground font-medium">Semester {sem.semester_number}</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    Year {years.find((y) => y.id === sem.year_id)?.year_number || "-"}
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-transparent text-destructive hover:text-destructive"
                      onClick={() => handleDeleteSemester(sem.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
