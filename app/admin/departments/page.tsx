"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { Card } from "@/components/card-component"
import { createClient } from "@/lib/client"

interface Department {
  id: number
  name: string
  description: string | null
  category_id: number | null
}

interface Category {
  id: number
  name: string
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
    category_id: "",
  })
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    Promise.all([fetchDepartments(), fetchCategories()])
  }, [])

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase.from("departments").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setDepartments(data || [])
    } catch (error) {
      console.error("Error fetching departments:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("id, name")
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDepartment.name.trim()) return

    try {
      const { error } = await supabase.from("departments").insert([
        {
          name: newDepartment.name,
          description: newDepartment.description,
          category_id: newDepartment.category_id ? Number.parseInt(newDepartment.category_id) : null,
        },
      ])

      if (error) throw error
      setNewDepartment({ name: "", description: "", category_id: "" })
      setShowForm(false)
      fetchDepartments()
    } catch (error) {
      console.error("Error adding department:", error)
    }
  }

  const handleDeleteDepartment = async (id: number) => {
    if (!confirm("Are you sure you want to delete this department?")) return

    try {
      const { error } = await supabase.from("departments").delete().eq("id", id)
      if (error) throw error
      fetchDepartments()
    } catch (error) {
      console.error("Error deleting department:", error)
    }
  }

  if (loading) return <div className="text-center py-8">Loading departments...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Departments</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleAddDepartment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Department Name</label>
                <input
                  type="text"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  placeholder="e.g., Computer Science"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                <select
                  value={newDepartment.category_id}
                  onChange={(e) => setNewDepartment({ ...newDepartment, category_id: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={newDepartment.description}
                onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                placeholder="Department description"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-20"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Add Department
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
              <th className="text-left py-3 px-4 font-semibold text-foreground">Department</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Description</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 px-4 text-center text-muted-foreground">
                  No departments found. Add one to get started!
                </td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept.id} className="border-b border-border hover:bg-secondary/20">
                  <td className="py-3 px-4 text-foreground font-medium">{dept.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {categories.find((c) => c.id === dept.category_id)?.name || "-"}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">{dept.description || "-"}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-transparent">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent text-destructive hover:text-destructive"
                        onClick={() => handleDeleteDepartment(dept.id)}
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
