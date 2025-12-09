"use client"

import type { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export function Card({ children, className = "", onClick, hoverable = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-border bg-card p-6 shadow-sm transition-all ${
        hoverable ? "cursor-pointer hover:shadow-md hover:border-primary/50" : ""
      } ${className}`}
    >
      {children}
    </div>
  )
}
