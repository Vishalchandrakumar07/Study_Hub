"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function SetupDatabase() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSetup = async () => {
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch("/api/admin/setup-database", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to setup database. Check console for details.")
        console.error("[v0] Setup error:", data.details)
      } else {
        setMessage("✅ Database schema created successfully!")
      }
    } catch (err) {
      setError("Error: " + (err instanceof Error ? err.message : "Unknown error occurred"))
      console.error("[v0] Setup error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleManualSetup = () => {
    alert(`
To manually setup the database in Supabase:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy the SQL from /scripts/01-create-schema.sql
5. Paste it in the SQL editor
6. Click "Run"

This will create all necessary tables with Row Level Security policies.
    `)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Database Setup</h1>
        <p className="text-slate-600 mb-6">
          Initialize your Supabase database with all required tables and configurations.
        </p>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-6">{message}</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-6 text-sm">{error}</div>
        )}

        <div className="space-y-3">
          <Button onClick={handleSetup} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
            {loading ? "Setting up..." : "Setup Database"}
          </Button>

          <Button onClick={handleManualSetup} variant="outline" className="w-full bg-transparent" size="lg">
            Manual Setup Instructions
          </Button>
        </div>

        <div className="mt-8 p-4 bg-slate-50 rounded-lg">
          <h3 className="font-semibold text-slate-900 mb-2">What will be created:</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>✓ Categories</li>
            <li>✓ Departments</li>
            <li>✓ Years</li>
            <li>✓ Semesters</li>
            <li>✓ Subjects</li>
            <li>✓ Materials</li>
            <li>✓ Exam Schedules</li>
            <li>✓ Timetables</li>
            <li>✓ Opinions</li>
            <li>✓ Admin Profiles</li>
            <li>✓ Row Level Security Policies</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
