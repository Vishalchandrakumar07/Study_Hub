"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
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
  code: string
  name: string
  credits: string
  category_id: number
  department_id: number
  year_id: number
  semester_id: number
  description?: string | null  // add if you use description
}



export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [years, setYears] = useState<Year[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState<number | "">("")
  const [selectedDepartment, setSelectedDepartment] = useState<number | "">("")
  const [selectedYear, setSelectedYear] = useState<number | "">("")
  const [selectedSemester, setSelectedSemester] = useState<number | "">("")

  const [newSubject, setNewSubject] = useState({
    code: "",
    name: "",
    credits: "",
    category_id: "",
    department_id: "",
    year_id: "",
    semester_id: "",
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

  const fetchAllData = async () => {
    try {
      const [categoriesRes, departmentsRes, yearsRes, semestersRes, subjectsRes] = await Promise.all([
        supabase.from("categories").select("id, name"),
        supabase.from("departments").select("id, name, category_id"),
        supabase.from("years").select("id, year_number, department_id"),
        supabase.from("semesters").select("id, semester_number, year_id"),
        supabase.from("subjects").select("*").order("created_at", { ascending: false }),
      ])

      if (categoriesRes.data) setCategories(categoriesRes.data)
      if (departmentsRes.data) setDepartments(departmentsRes.data)
      if (yearsRes.data) setYears(yearsRes.data)
      if (semestersRes.data) setSemesters(semestersRes.data)
      if (subjectsRes.data) setSubjects(subjectsRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubject.code.trim() || !newSubject.name.trim() || !selectedSemester) return

    try {
      const { error } = await supabase.from("subjects").insert([
          {
            code: newSubject.code,
            name: newSubject.name,
            credits: newSubject.credits ? Number(newSubject.credits) : null,
            category_id: Number(selectedCategory),
            department_id: Number(selectedDepartment),
            year_id: Number(selectedYear),
            semester_id: Number(selectedSemester),
            description: newSubject.description || null   // ✅ ADD THIS
          }
        ])


      if (error) throw error
      setNewSubject({
        code: "",
        name: "",
        credits: "",
        category_id: "",
        department_id: "",
        year_id: "",
        semester_id: "",
      })
      setSelectedCategory("")
      setSelectedDepartment("")
      setSelectedYear("")
      setSelectedSemester("")
      setShowForm(false)
      fetchAllData()
    } catch (error) {
      console.error("Error adding subject:", error)
    }
  }

  const handleDeleteSubject = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subject?")) return

    try {
      const { error } = await supabase.from("subjects").delete().eq("id", id)
      if (error) throw error
      fetchAllData()
    } catch (error) {
      console.error("Error deleting subject:", error)
    }
  }

  const filteredSubjects = subjects.filter((subject) => {
    const searchLower = searchTerm.toLowerCase()
    return subject.code.toLowerCase().includes(searchLower) || subject.name.toLowerCase().includes(searchLower)
  })

  if (loading) return <div className="text-center py-8">Loading subjects...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Subjects</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {/* Add Subject Form */}
      {showForm && (
        <Card>
          <form onSubmit={handleAddSubject} className="space-y-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Subject Code</label>
                <input
                  type="text"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                  placeholder="e.g., CS101"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Subject Name</label>
                <input
                  type="text"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  placeholder="e.g., Data Structures"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Credits</label>
                <input
                  type="number"
                  value={newSubject.credits}
                  onChange={(e) => setNewSubject({ ...newSubject, credits: e.target.value })}
                  placeholder="e.g., 4"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Add Subject
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
          placeholder="Search by code or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Subjects Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-foreground">Code</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Semester</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Credits</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubjects.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 px-4 text-center text-muted-foreground">
                  No subjects found.
                </td>
              </tr>
            ) : (
              filteredSubjects.map((subject) => {
                const category = categories.find((c) => c.id === subject.category_id)
                return (
                  <tr key={subject.id} className="border-b border-border hover:bg-secondary/20">
                    <td className="py-3 px-4 text-primary font-semibold">{subject.code}</td>
                    <td className="py-3 px-4 text-foreground">{subject.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{category?.name || "-"}</td>
                    <td className="py-3 px-4 text-muted-foreground">Sem {subject.semester_id}</td>
                    <td className="py-3 px-4 text-muted-foreground">{subject.credits || "-"}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent text-destructive hover:text-destructive"
                          onClick={() => handleDeleteSubject(subject.id)}
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
