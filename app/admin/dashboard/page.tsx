"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/card-component"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, FolderOpen, BookOpen, FileText, MessageSquare } from "lucide-react"
import { createClient } from "@/lib/client"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    categories: 0,
    subjects: 0,
    materials: 0,
    opinions: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [categoriesRes, subjectsRes, materialsRes, opinionsRes] = await Promise.all([
          supabase.from("categories").select("*", { count: "exact", head: true }),
          supabase.from("subjects").select("*", { count: "exact", head: true }),
          supabase.from("materials").select("*", { count: "exact", head: true }),
          supabase.from("opinions").select("*", { count: "exact", head: true }),
        ])

        setStats({
          categories: categoriesRes.count || 0,
          subjects: subjectsRes.count || 0,
          materials: materialsRes.count || 0,
          opinions: opinionsRes.count || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  const statCards = [
    {
      label: "Categories",
      value: stats.categories.toString(),
      icon: FolderOpen,
      color: "bg-blue-50 text-blue-600",
      href: "/admin/categories",
    },
    {
      label: "Subjects",
      value: stats.subjects.toString(),
      icon: BookOpen,
      color: "bg-green-50 text-green-600",
      href: "/admin/subjects",
    },
    {
      label: "Study Materials",
      value: stats.materials.toString(),
      icon: FileText,
      color: "bg-purple-50 text-purple-600",
      href: "/admin/materials",
    },
    {
      label: "Student Opinions",
      value: stats.opinions.toString(),
      icon: MessageSquare,
      color: "bg-orange-50 text-orange-600",
      href: "/admin/opinions",
    },
  ]

  const quickActions = [
    { label: "Add Category", href: "/admin/categories" },
    { label: "Add Subject", href: "/admin/subjects" },
    { label: "Upload Materials", href: "/admin/materials" },
    { label: "Manage Opinions", href: "/admin/opinions" },
  ]

  if (loading) return <div className="text-center py-8">Loading dashboard...</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Welcome to Admin Panel</h1>
        <p className="text-lg text-muted-foreground">Manage all college study materials and resources</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hoverable>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Button variant="outline" className="w-full justify-between bg-transparent hover:bg-secondary/30">
                <span>{action.label}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ))}
        </div>
      </Card>

      {/* System Information */}
      <Card>
        <h2 className="text-2xl font-bold text-foreground mb-6">System Information</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-muted-foreground">Total Documents</span>
            <span className="font-semibold text-foreground">{stats.materials}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-muted-foreground">Total Subjects</span>
            <span className="font-semibold text-foreground">{stats.subjects}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">Student Feedback Count</span>
            <span className="font-semibold text-foreground">{stats.opinions}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
