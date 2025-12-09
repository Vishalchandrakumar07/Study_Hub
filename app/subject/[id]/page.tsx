"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card } from "@/components/card-component"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, Star } from "lucide-react"
import { createClient } from "@/lib/client"

interface SubjectPageProps {
  params: Promise<{ id: string }>
}

export default function SubjectPage({ params }: SubjectPageProps) {
  // ⬅️ FIX: unwrap params (Next.js App Router rule)
  const resolved = React.use(params)
  const fullId = resolved.id              // "3-3-3-17"
  const subjectId = Number(fullId.split("-").pop())  // → 17


  // ⬅️ FIX: define supabase BEFORE useEffect
  const supabase = createClient()

  // ===============================
  // STATES
  // ===============================
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [subject, setSubject] = useState<any>(null)
  const [departmentName, setDepartmentName] = useState<string>("")
  const [yearNumber, setYearNumber] = useState<number | null>(null)
  const [semesterNumber, setSemesterNumber] = useState<number | null>(null)

  const [materials, setMaterials] = useState<any[]>([])
  const [opinions, setOpinions] = useState<any[]>([])

  const [activeTab, setActiveTab] =
    useState<"materials" | "pyq" | "syllabus" | "models" | "opinions">("materials")

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submittingOpinion, setSubmittingOpinion] = useState(false)

  // ===============================
  // LOAD DATA
  // ===============================
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        // 1️⃣ Fetch subject
        const { data: subjectData, error: subjectErr } = await supabase
          .from("subjects")
          .select("*")
          .eq("id", subjectId)
          .single()

        if (subjectErr || !subjectData) {
          setError("Subject not found")
          return
        }

        setSubject(subjectData)

        // 2️⃣ Load Department - Year - Semester
        const [deptRes, yearRes, semRes] = await Promise.all([
          subjectData.department_id
            ? supabase.from("departments").select("name").eq("id", subjectData.department_id).single()
            : Promise.resolve({ data: null }),

          subjectData.year_id
            ? supabase.from("years").select("year_number").eq("id", subjectData.year_id).single()
            : Promise.resolve({ data: null }),

          subjectData.semester_id
            ? supabase.from("semesters").select("semester_number").eq("id", subjectData.semester_id).single()
            : Promise.resolve({ data: null })
        ])

        if (deptRes?.data) setDepartmentName(deptRes.data.name)
        if (yearRes?.data) setYearNumber(yearRes.data.year_number)
        if (semRes?.data) setSemesterNumber(semRes.data.semester_number)

        // 3️⃣ Fetch materials
        const { data: materialsData } = await supabase
          .from("materials")
          .select("*")
          .eq("subject_id", subjectId)
          .order("created_at", { ascending: false })

        if (materialsData) setMaterials(materialsData)

        // 4️⃣ Fetch opinions
        const { data: opinionsData } = await supabase
          .from("opinions")
          .select("*")
          .eq("subject_id", subjectId)
          .order("created_at", { ascending: false })

        if (opinionsData) setOpinions(opinionsData)

      } catch (err) {
        console.error(err)
        setError("Failed to load subject")
      } finally {
        setLoading(false)
      }
    }

    if (subjectId) load()
  }, [subjectId])

  // ===============================
  // HANDLE OPINION SUBMIT
  // ===============================
  const handleSubmitOpinion = async () => {
    if (rating === 0 || !comment.trim()) return

    setSubmittingOpinion(true)
    try {
      const { error } = await supabase.from("opinions").insert([
        {
          subject_id: subjectId,
          rating,
          comment
        }
      ])

      if (error) {
        console.error(error)
        return
      }

      // reload opinions
      const { data } = await supabase
        .from("opinions")
        .select("*")
        .eq("subject_id", subjectId)
        .order("created_at", { ascending: false })

      if (data) setOpinions(data)

      setRating(0)
      setComment("")
    } finally {
      setSubmittingOpinion(false)
    }
  }

  // ===============================
  // GROUP MATERIALS
  // ===============================
  const studyMaterials = materials.filter((m) => m.type === "notes")
  const pyqMaterials = materials.filter((m) => m.type === "pyq")
  const syllabusMaterials = materials.filter((m) => m.type === "syllabus")
  const modelMaterials = materials.filter((m) => m.type === "model")

  const avgRating =
    opinions.length > 0
      ? (opinions.reduce((s, o) => s + o.rating, 0) / opinions.length).toFixed(1)
      : "0.0"

  // ===============================
  // LOADING + ERROR UI
  // ===============================
  if (loading) {
    return (
      <LayoutWrapper>
        <section className="py-12 text-center">
          <p className="text-muted-foreground">Loading subject...</p>
        </section>
      </LayoutWrapper>
    )
  }

  if (error || !subject) {
    return (
      <LayoutWrapper>
        <section className="py-12 text-center">
          <p className="text-red-500">{error ?? "Subject not found"}</p>
        </section>
      </LayoutWrapper>
    )
  }

  // ===============================
  // FINAL UI
  // ===============================
  return (
    <LayoutWrapper
      breadcrumbs={[
        { label: "Browse", href: "/browse" },
        { label: departmentName, href: `/department/${subject.department_id}` },
        { label: `Year ${yearNumber}`, href: `/year/${subject.department_id}-${yearNumber}` },
        { label: `Semester ${semesterNumber}`, href: `/semester/${subject.department_id}-${yearNumber}-${semesterNumber}` },
        { label: `${subject.code} - ${subject.name}` }
      ]}
    >

      {/* HEADER */}
      <section className="py-12">
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-primary font-semibold mb-2">{subject.code}</p>
              <h1 className="text-4xl font-bold text-foreground mb-2">{subject.name}</h1>
              <p className="text-lg text-muted-foreground">Complete study materials and resources</p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Number(avgRating) ? "fill-primary text-primary" : "text-border"
                    }`}
                  />
                ))}
              </div>
              <p className="text-lg font-semibold">{avgRating} / 5</p>
              <p className="text-xs text-muted-foreground">{opinions.length} reviews</p>
            </div>
          </div>
        </Card>

        {/* TABS */}
        <div className="mb-8 border-b border-border flex gap-4">
          {[
            { id: "materials", label: "Study Materials" },
            { id: "pyq", label: "Previous Year Papers" },
            { id: "syllabus", label: "Syllabus" },
            { id: "models", label: "Model Papers" },
            { id: "opinions", label: "Student Opinions" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-2 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* MATERIALS TAB */}
        {activeTab === "materials" && (
          <div className="space-y-3">
            {studyMaterials.map((m) => (
              <Card key={m.id} hoverable className="py-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 bg-primary/10 h-10 w-10 flex items-center justify-center rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{m.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{m.created_at}</p>
                    </div>
                  </div>
                  {m.pdf_url && (
                    <a href={m.pdf_url} target="_blank">
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        View PDF
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* PYQ TAB */}
        {activeTab === "pyq" && (
          <div className="space-y-3">
            {pyqMaterials.map((m) => (
              <Card key={m.id} hoverable className="py-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 bg-primary/10 h-10 w-10 flex items-center justify-center rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{m.title}</h3>
                    <p className="text-xs text-muted-foreground">{m.created_at}</p>
                  </div>
                  {m.pdf_url && (
                    <a href={m.pdf_url} target="_blank">
                      <Button size="sm">View PDF</Button>
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* SYLLABUS TAB */}
        {activeTab === "syllabus" && (
          <div className="space-y-3">
            {syllabusMaterials.length === 0 ? (
              <p className="text-muted-foreground">No syllabus uploaded.</p>
            ) : (
              syllabusMaterials.map((m) => (
                <Card key={m.id} hoverable className="py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{m.title}</h3>
                    {m.pdf_url && (
                      <a href={m.pdf_url} target="_blank">
                        <Button size="sm">View PDF</Button>
                      </a>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* MODEL PAPERS TAB */}
        {activeTab === "models" && (
          <div className="space-y-3">
            {modelMaterials.map((m) => (
              <Card key={m.id} hoverable className="py-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{m.title}</h3>
                  {m.pdf_url && (
                    <a href={m.pdf_url} target="_blank">
                      <Button size="sm">View PDF</Button>
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* OPINIONS TAB */}
        {activeTab === "opinions" && (
          <div className="space-y-8">
            <Card className="p-6 bg-secondary/30">
              <h3 className="text-lg font-semibold mb-4">Share Your Opinion</h3>

              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    onClick={() => setRating(star)}
                    className={`h-7 w-7 cursor-pointer ${
                      star <= rating ? "fill-primary text-primary" : "text-border"
                    }`}
                  />
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Write your feedback..."
              />

              <Button
                className="mt-4 w-full"
                disabled={submittingOpinion || rating === 0 || !comment.trim()}
                onClick={handleSubmitOpinion}
              >
                Submit
              </Button>
            </Card>

            <h3 className="text-lg font-semibold">Student Reviews</h3>
            <div className="space-y-3">
              {opinions.map((o) => (
                <Card key={o.id} className="p-4">
                  <div className="flex gap-2 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= o.rating ? "fill-primary text-primary" : "text-border"
                        }`}
                      />
                    ))}
                  </div>
                  <p>{o.comment}</p>
                  <p className="text-xs text-muted-foreground mt-2">{o.created_at}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </section>
    </LayoutWrapper>
  )
}
