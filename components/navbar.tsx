"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const pathname = usePathname()

  const isAdminPage = pathname.startsWith("/admin")

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              C
            </div>
            <span className="text-lg font-semibold text-foreground hidden sm:inline">College Study Hub</span>
          </Link>

          {/* Navigation Links */}
          {!isAdminPage && (
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link
                href="/exam-schedule"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Exam Schedule
              </Link>
              <Link href="/timetable" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                College Timetable
              </Link>
              <Link
                href="/all-subjects"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                All Subjects
              </Link>
            </div>
          )}

          {/* Admin Login Button */}
          {!isAdminPage && (
            <Link href="/admin/login">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Admin Login
              </Button>
            </Link>
          )}

          {isAdminPage && (
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Home
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
