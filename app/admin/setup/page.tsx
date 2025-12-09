"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/card-component"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/client"

export default function AdminSetupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Sign up new admin user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/admin/dashboard`,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (!authData.user) {
        setError("Failed to create user")
        return
      }

      // Create admin profile
      const { error: profileError } = await supabase.from("admin_profiles").insert([
        {
          id: authData.user.id,
          email,
          name,
          role: "admin",
        },
      ])

      if (profileError) {
        setError("Failed to create admin profile: " + profileError.message)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/admin/login")
      }, 2000)
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="py-8 px-6 text-center">
            <div className="h-12 w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mx-auto mb-4">
              ✓
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Setup Complete!</h1>
            <p className="text-muted-foreground mb-4">Admin account created successfully. Redirecting to login...</p>
            <Link href="/admin/login">
              <Button className="w-full bg-primary">Go to Login</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
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
            <p className="text-muted-foreground">Admin Setup - Create First Admin Account</p>
          </div>

          <form onSubmit={handleSetup} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

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
                placeholder="Create a strong password"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? "Creating Admin Account..." : "Create Admin Account"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Already have an admin account?{" "}
              <Link href="/admin/login" className="text-primary hover:underline">
                Login here
              </Link>
            </p>
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
