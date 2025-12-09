"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Download, Trash2 } from "lucide-react"
import { Card } from "@/components/card-component"
import { createClient } from "@/lib/client"

interface Timetable {
  id: number
  title: string
  description: string | null
  pdf_url: string | null
  created_at: string
}

export default function TimetablePage() {
  const [timetables, setTimetables] = useState<Timetable[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [newTimetable, setNewTimetable] = useState({
    title: "",
    description: "",
    pdf_file: null as File | null,
  })
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchTimetables()
  }, [])

  const fetchTimetables = async () => {
    try {
      const { data, error } = await supabase.from("timetables").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setTimetables(data || [])
    } catch (error) {
      console.error("Error fetching timetables:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTimetable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTimetable.title.trim()) return

    setUploading(true)
    try {
      let pdfUrl = null

      if (newTimetable.pdf_file) {
        const fileExt = newTimetable.pdf_file.name.split(".").pop()
        const fileName = `timetable-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage.from("materials").upload(fileName, newTimetable.pdf_file)

        if (uploadError) throw uploadError

        const { data: publicData } = supabase.storage.from("materials").getPublicUrl(fileName)
        pdfUrl = publicData.publicUrl
      }

      const { error } = await supabase.from("timetables").insert([
        {
          title: newTimetable.title,
          description: newTimetable.description,
          pdf_url: pdfUrl,
        },
      ])

      if (error) throw error
      setNewTimetable({ title: "", description: "", pdf_file: null })
      setShowForm(false)
      fetchTimetables()
    } catch (error) {
      console.error("Error adding timetable:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteTimetable = async (id: number) => {
    if (!confirm("Are you sure you want to delete this timetable?")) return

    try {
      const { error } = await supabase.from("timetables").delete().eq("id", id)
      if (error) throw error
      fetchTimetables()
    } catch (error) {
      console.error("Error deleting timetable:", error)
    }
  }

  if (loading) return <div className="text-center py-8">Loading timetables...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Timetable</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Timetable
        </Button>
      </div>

      {/* Add Timetable Form */}
      {showForm && (
        <Card>
          <form onSubmit={handleAddTimetable} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Title</label>
              <input
                type="text"
                value={newTimetable.title}
                onChange={(e) => setNewTimetable({ ...newTimetable, title: e.target.value })}
                placeholder="e.g., Engineering Department Timetable"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={newTimetable.description}
                onChange={(e) => setNewTimetable({ ...newTimetable, description: e.target.value })}
                placeholder="Timetable description"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Upload PDF</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setNewTimetable({ ...newTimetable, pdf_file: e.target.files?.[0] || null })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {newTimetable.pdf_file && <p className="text-sm text-primary mt-2">File: {newTimetable.pdf_file.name}</p>}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={uploading} className="bg-primary hover:bg-primary/90">
                {uploading ? "Uploading..." : "Add Timetable"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="bg-transparent">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Timetables Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-foreground">Title</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timetables.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 px-4 text-center text-muted-foreground">
                  No timetables found. Add one to get started!
                </td>
              </tr>
            ) : (
              timetables.map((timetable) => (
                <tr key={timetable.id} className="border-b border-border hover:bg-secondary/20">
                  <td className="py-3 px-4 text-foreground">{timetable.title}</td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">
                    {new Date(timetable.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {timetable.pdf_url && (
                        <a href={timetable.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="bg-transparent">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent text-destructive hover:text-destructive"
                        onClick={() => handleDeleteTimetable(timetable.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
