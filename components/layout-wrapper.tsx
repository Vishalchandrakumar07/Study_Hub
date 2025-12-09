"use client"

import type React from "react"

import { Navbar } from "./navbar"
import { Breadcrumbs, type BreadcrumbItem } from "./breadcrumbs"

interface LayoutWrapperProps {
  children: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
}

export function LayoutWrapper({ children, breadcrumbs = [] }: LayoutWrapperProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <Navbar />
      {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
