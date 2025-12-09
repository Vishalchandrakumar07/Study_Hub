"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { Card } from "@/components/card-component"
import { createClient } from "@/lib/client"

interface Year {
  id: number
  year_number: number
  department_id: number | null
}

interface Department {
  id: number
  name: string
}

export default function YearsPage() {
  const [years, setYears] = useState<Year[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [newYear, setNewYear] = useState({ year_number: "", department_id: "" })
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    Promise.all([fetchYears(), fetchDepartments()])
  }, [])

  const fetchYears = async () => {
    try {
      const { data, error } = await supabase.from("years").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setYears(data || [])
    } catch (error) {
      console.error("Error fetching years:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase.from("departments").select("id, name")
      if (error) throw error
      setDepartments(data || [])
    } catch (error) {
      console.error("Error fetching departments:", error)
    }
  }

  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newYear.year_number || !newYear.department_id) return

    try {
      const { error } = await supabase.from("years").insert([
        {
          year_number: Number.parseInt(newYear.year_number),
          department_id: Number.parseInt(newYear.department_id),
        },
      ])

      if (error) throw error
      setNewYear({ year_number: "", department_id: "" })
      setShowForm(false)
      fetchYears()
    } catch (error) {
      console.error("Error adding year:", error)
    }
  }

  const handleDeleteYear = async (id: number) => {
    if (!confirm("Are you sure you want to delete this year?")) return

    try {
      const { error } = await supabase.from("years").delete().eq("id", id)
      if (error) throw error
      fetchYears()
    } catch (error) {
      console.error("Error deleting year:", error)
    }
  }

  if (loading) return <div className="text-center py-8">Loading years...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Academic Years</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Year
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleAddYear} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Year Number</label>
                <select
                  value={newYear.year_number}
                  onChange={(e) => setNewYear({ ...newYear, year_number: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="">Select year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Department</label>
                <select
                  value={newYear.department_id}
                  onChange={(e) => setNewYear({ ...newYear, department_id: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Add Year
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
              <th className="text-left py-3 px-4 font-semibold text-foreground">Year</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Department</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {years.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 px-4 text-center text-muted-foreground">
                  No years found. Add one to get started!
                </td>
              </tr>
            ) : (
              years.map((year) => (
                <tr key={year.id} className="border-b border-border hover:bg-secondary/20">
                  <td className="py-3 px-4 text-foreground font-medium">Year {year.year_number}</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {departments.find((d) => d.id === year.department_id)?.name || "-"}
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-transparent text-destructive hover:text-destructive"
                      onClick={() => handleDeleteYear(year.id)}
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
