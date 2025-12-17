"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Download, Trash2 } from "lucide-react"
import { Card } from "@/components/card-component"
import { createClient } from "@/lib/client"

interface TimetableDocument {
  id: number
  title: string
  description: string | null
  pdf_url: string
  created_at: string
}

export default function AdminTimetablePage() {
  const supabase = createClient()

  const [timetables, setTimetables] = useState<TimetableDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [newTimetable, setNewTimetable] = useState({
    title: "",
    description: "",
    pdf_file: null as File | null,
  })

  /* -------------------------------- fetch -------------------------------- */

  const fetchTimetables = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("timetable_documents")
      .select("id, title, description, pdf_url, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Fetch error:", error)
    } else {
      setTimetables(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchTimetables()
  }, [])

  /* -------------------------------- insert -------------------------------- */

  const handleAddTimetable = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newTimetable.title || !newTimetable.pdf_file) {
      alert("Title and PDF are required")
      return
    }

    setUploading(true)

    try {
      /* 1️⃣ Upload PDF */
      const fileName = `timetables/${Date.now()}-${newTimetable.pdf_file.name}`

      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(fileName, newTimetable.pdf_file)

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw uploadError
      }

      const { data: publicData } = supabase.storage
        .from("materials")
        .getPublicUrl(fileName)

      const pdfUrl = publicData.publicUrl

      /* 2️⃣ Insert DB row */
      const { error: insertError } = await supabase
        .from("timetable_documents")
        .insert([
          {
            title: newTimetable.title,
            description: newTimetable.description || null,
            pdf_url: pdfUrl,
          },
        ])

      if (insertError) {
        console.error("Supabase insert error:", insertError)
        throw insertError
      }

      /* 3️⃣ Reset */
      setNewTimetable({ title: "", description: "", pdf_file: null })
      setShowForm(false)
      fetchTimetables()
    } catch (err) {
      console.error("Error adding timetable:", err)
      alert("Failed to add timetable. Check console.")
    } finally {
      setUploading(false)
    }
  }

  /* -------------------------------- delete -------------------------------- */

  const handleDelete = async (doc: TimetableDocument) => {
    if (!confirm("Delete this timetable?")) return

    try {
      // remove file from storage
      const path = doc.pdf_url.split("/materials/")[1]
      if (path) {
        await supabase.storage.from("materials").remove([path])
      }

      // remove db row
      const { error } = await supabase
        .from("timetable_documents")
        .delete()
        .eq("id", doc.id)

      if (error) throw error

      fetchTimetables()
    } catch (err) {
      console.error("Delete error:", err)
      alert("Failed to delete timetable")
    }
  }

  /* -------------------------------- render -------------------------------- */

  if (loading) {
    return <div className="text-center py-8">Loading timetables...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Timetable Documents</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Timetable
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card>
          <form onSubmit={handleAddTimetable} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Title</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={newTimetable.title}
                onChange={(e) =>
                  setNewTimetable({ ...newTimetable, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Description</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                value={newTimetable.description}
                onChange={(e) =>
                  setNewTimetable({
                    ...newTimetable,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm mb-1">PDF File</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) =>
                  setNewTimetable({
                    ...newTimetable,
                    pdf_file: e.target.files?.[0] || null,
                  })
                }
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={uploading}>
                {uploading ? "Uploading..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3">Title</th>
              <th className="text-left py-2 px-3">Date</th>
              <th className="text-left py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timetables.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4">
                  No timetables found
                </td>
              </tr>
            ) : (
              timetables.map((doc) => (
                <tr key={doc.id} className="border-b">
                  <td className="py-2 px-3">{doc.title}</td>
                  <td className="py-2 px-3 text-sm text-muted-foreground">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3 flex gap-2">
                    <a href={doc.pdf_url} target="_blank">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => handleDelete(doc)}
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
