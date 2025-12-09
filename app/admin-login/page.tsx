"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/card-component"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/client"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message || "Login failed")
        return
      }

      if (data.user) {
        // Verify user is admin
        const { data: adminProfile, error: profileError } = await supabase
          .from("admin_profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()

        if (profileError || !adminProfile || adminProfile.role !== "admin") {
          setError("You do not have admin access")
          await supabase.auth.signOut()
          return
        }

        router.push("/admin/dashboard")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="py-8 px-6">
          <div className="text-center mb-8">
            <div className="h-12 w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mx-auto mb-4">
              C
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">College Study Hub</h1>
            <p className="text-muted-foreground">Admin Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@college.edu"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-2">Demo Setup:</p>
            <p className="text-xs text-muted-foreground">Use your Supabase credentials to login</p>
          </div>

          <Link href="/" className="block text-center mt-4">
            <Button variant="outline" className="w-full bg-transparent">
              Back to Home
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
