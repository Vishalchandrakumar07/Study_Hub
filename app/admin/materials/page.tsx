"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Download, Trash2 } from "lucide-react"
import { Card } from "@/components/card-component"
import { createClient } from "@/lib/client"

interface Category {
  id: number
  name: string
}

interface Department {
  id: number
  name: string
  category_id: number
}

interface Year {
  id: number
  year_number: number
  department_id: number
}

interface Semester {
  id: number
  semester_number: number
  year_id: number
}

interface Subject {
  id: number
  name: string
  code: string
  semester_id: number
}

interface Material {
  id: number
  title: string
  type: string
  description: string | null
  pdf_url: string | null
  created_at: string
  subject_id: number
  category_id: number
  department_id: number
  year_id: number
  semester_id: number
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [years, setYears] = useState<Year[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState<number | "">("")
  const [selectedDepartment, setSelectedDepartment] = useState<number | "">("")
  const [selectedYear, setSelectedYear] = useState<number | "">("")
  const [selectedSemester, setSelectedSemester] = useState<number | "">("")
  const [selectedSubject, setSelectedSubject] = useState<number | "">("")

  const [newMaterial, setNewMaterial] = useState({
    title: "",
    type: "notes",
    description: "",
    pdf_file: null as File | null,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchAllData()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      const filtered = departments.filter((d) => d.category_id === Number(selectedCategory))
      setDepartments(filtered)
      setSelectedDepartment("")
    }
  }, [selectedCategory])

  useEffect(() => {
    if (selectedDepartment) {
      const filtered = years.filter((y) => y.department_id === Number(selectedDepartment))
      setYears(filtered)
      setSelectedYear("")
    }
  }, [selectedDepartment])

  useEffect(() => {
    if (selectedYear) {
      const filtered = semesters.filter((s) => s.year_id === Number(selectedYear))
      setSemesters(filtered)
      setSelectedSemester("")
    }
  }, [selectedYear])

  useEffect(() => {
    if (selectedSemester) {
      const filtered = subjects.filter((s) => s.semester_id === Number(selectedSemester))
      setSubjects(filtered)
      setSelectedSubject("")
    }
  }, [selectedSemester])

  const fetchAllData = async () => {
    try {
      const [categoriesRes, departmentsRes, yearsRes, semestersRes, subjectsRes, materialsRes] = await Promise.all([
        supabase.from("categories").select("id, name"),
        supabase.from("departments").select("id, name, category_id"),
        supabase.from("years").select("id, year_number, department_id"),
        supabase.from("semesters").select("id, semester_number, year_id"),
        supabase.from("subjects").select("id, name, code, semester_id"),
        supabase.from("materials").select("*").order("created_at", { ascending: false }),
      ])

      if (categoriesRes.data) setCategories(categoriesRes.data)
      if (departmentsRes.data) setDepartments(departmentsRes.data)
      if (yearsRes.data) setYears(yearsRes.data)
      if (semestersRes.data) setSemesters(semestersRes.data)
      if (subjectsRes.data) setSubjects(subjectsRes.data)
      if (materialsRes.data) setMaterials(materialsRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMaterial.title.trim() || !selectedSubject) return

    setUploading(true)
    try {
      let pdfUrl = null

      if (newMaterial.pdf_file) {
        const category = categories.find((c) => c.id === Number(selectedCategory))
        const department = departments.find((d) => d.id === Number(selectedDepartment))
        const year = years.find((y) => y.id === Number(selectedYear))
        const subject = subjects.find((s) => s.id === Number(selectedSubject))

        const storagePath = `materials/${category?.name || "general"}/${department?.name || "general"}/${year?.year_number || "general"}/${selectedSemester}/${subject?.name || "general"}/${Date.now()}-${newMaterial.pdf_file.name}`

        const { error: uploadError } = await supabase.storage
          .from("materials")
          .upload(storagePath, newMaterial.pdf_file)

        if (uploadError) throw uploadError

        const { data: publicData } = supabase.storage.from("materials").getPublicUrl(storagePath)
        pdfUrl = publicData.publicUrl
      }

      const { error } = await supabase.from("materials").insert([
        {
          title: newMaterial.title,
          type: newMaterial.type,
          description: newMaterial.description,
          pdf_url: pdfUrl,
          subject_id: Number(selectedSubject),
          category_id: Number(selectedCategory),
          department_id: Number(selectedDepartment),
          year_id: Number(selectedYear),
          semester_id: Number(selectedSemester),
        },
      ])

      if (error) throw error
      setNewMaterial({ title: "", type: "notes", description: "", pdf_file: null })
      setSelectedCategory("")
      setSelectedDepartment("")
      setSelectedYear("")
      setSelectedSemester("")
      setSelectedSubject("")
      setShowForm(false)
      fetchAllData()
    } catch (error) {
      console.error("Error adding material:", error)
      alert("Error uploading material. Check console.")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm("Are you sure you want to delete this material?")) return

    try {
      const { error } = await supabase.from("materials").delete().eq("id", id)
      if (error) throw error
      fetchAllData()
    } catch (error) {
      console.error("Error deleting material:", error)
    }
  }

  const filteredMaterials = materials.filter((material) => {
    const searchLower = searchTerm.toLowerCase()
    const subject = subjects.find((s) => s.id === material.subject_id)
    return (
      material.title.toLowerCase().includes(searchLower) ||
      subject?.name.toLowerCase().includes(searchLower) ||
      subject?.code.toLowerCase().includes(searchLower)
    )
  })

  if (loading) return <div className="text-center py-8">Loading materials...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Study Materials</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Upload Material
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleAddMaterial} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value === "" ? "" : Number(e.target.value))}
                  disabled={!selectedCategory}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value === "" ? "" : Number(e.target.value))}
                  disabled={!selectedDepartment}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  required
                >
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year.id} value={year.id}>
                      Year {year.year_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Semester</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value === "" ? "" : Number(e.target.value))}
                  disabled={!selectedYear}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value === "" ? "" : Number(e.target.value))}
                  disabled={!selectedSemester}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subj) => (
                    <option key={subj.id} value={subj.id}>
                      {subj.code} - {subj.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Material Title</label>
              <input
                type="text"
                value={newMaterial.title}
                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                placeholder="e.g., Chapter 1: Arrays"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                <select
                  value={newMaterial.type}
                  onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="notes">Study Notes</option>
                  <option value="paper">Previous Year Paper</option>
                  <option value="syllabus">Syllabus</option>
                  <option value="model_paper">Model Paper</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={newMaterial.description}
                onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                placeholder="Material description"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Upload PDF</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setNewMaterial({ ...newMaterial, pdf_file: e.target.files?.[0] || null })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {newMaterial.pdf_file && <p className="text-sm text-primary mt-2">File: {newMaterial.pdf_file.name}</p>}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={uploading} className="bg-primary hover:bg-primary/90">
                {uploading ? "Uploading..." : "Add Material"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="bg-transparent">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search by title, subject, or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Materials Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-foreground">Title</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Subject</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 px-4 text-center text-muted-foreground">
                  No materials found.
                </td>
              </tr>
            ) : (
              filteredMaterials.map((material) => {
                const subject = subjects.find((s) => s.id === material.subject_id)
                return (
                  <tr key={material.id} className="border-b border-border hover:bg-secondary/20">
                    <td className="py-3 px-4 text-foreground">{material.title}</td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">
                      {subject?.code} - {subject?.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium capitalize">
                        {material.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">
                      {new Date(material.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {material.pdf_url && (
                          <a href={material.pdf_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="bg-transparent">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent text-destructive hover:text-destructive"
                          onClick={() => handleDeleteMaterial(material.id)}
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
