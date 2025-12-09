"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FolderOpen,
  BookOpen,
  FileText,
  Calendar,
  Clock,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  // No authentication required
  const isLoggedIn = true

  const handleLogout = () => {
    router.push("/admin/login")
  }

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/categories", icon: FolderOpen, label: "Categories" },
    { href: "/admin/departments", icon: FolderOpen, label: "Departments" },
    { href: "/admin/years", icon: FolderOpen, label: "Years" },
    { href: "/admin/semesters", icon: FolderOpen, label: "Semesters" },
    { href: "/admin/subjects", icon: BookOpen, label: "Subjects" },
    { href: "/admin/materials", icon: FileText, label: "Materials" },
    { href: "/admin/exam-schedule", icon: Calendar, label: "Exam Schedule" },
    { href: "/admin/timetable", icon: Clock, label: "Timetable" },
    { href: "/admin/opinions", icon: MessageSquare, label: "Opinions" },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-primary-foreground"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:static left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transform transition-transform md:translate-x-0 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <Link href="/admin/dashboard" className="flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              C
            </div>
            <span className="font-semibold text-sidebar-foreground">Admin Panel</span>
          </Link>

          <nav className="space-y-2 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="border-t border-sidebar-border pt-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 bg-transparent text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-8">{children}</div>
      </main>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
