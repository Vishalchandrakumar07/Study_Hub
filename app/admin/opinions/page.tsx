"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/card-component"
import { Button } from "@/components/ui/button"
import { Trash2, Eye } from "lucide-react"
import { Star } from "lucide-react"
import { createClient } from "@/lib/client"

interface Opinion {
  id: number
  subject: string
  rating: number
  comment: string
  created_at: string
}

export default function OpinionsPage() {
  const [opinions, setOpinions] = useState<Opinion[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchOpinions()
  }, [])

  const fetchOpinions = async () => {
    try {
      const { data, error } = await supabase.from("opinions").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setOpinions(data || [])
    } catch (error) {
      console.error("Error fetching opinions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOpinion = async (id: number) => {
    if (!confirm("Are you sure you want to delete this opinion?")) return

    try {
      const { error } = await supabase.from("opinions").delete().eq("id", id)
      if (error) throw error
      fetchOpinions()
    } catch (error) {
      console.error("Error deleting opinion:", error)
    }
  }

  if (loading) return <div className="text-center py-8">Loading opinions...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Student Opinions</h1>
        <p className="text-muted-foreground mt-2">Review and manage student feedback</p>
      </div>

      <div className="space-y-4">
        {opinions.length === 0 ? (
          <Card>
            <p className="text-center text-muted-foreground">No student opinions yet</p>
          </Card>
        ) : (
          opinions.map((opinion) => (
            <Card key={opinion.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-primary font-semibold mb-1">{opinion.subject}</p>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < opinion.rating ? "fill-primary text-primary" : "text-border"}`}
                      />
                    ))}
                  </div>
                  <p className="text-foreground mb-2">{opinion.comment}</p>
                  <p className="text-xs text-muted-foreground">{new Date(opinion.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="bg-transparent">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-transparent text-destructive hover:text-destructive"
                    onClick={() => handleDeleteOpinion(opinion.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
