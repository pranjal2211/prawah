"use client"

import type React from "react"

interface StatusBadgeProps {
  status: "high" | "medium" | "low" | "excellent" | "good" | "warning" | "critical"
  label: string
  icon?: React.ReactNode
}

export function StatusBadge({ status, label, icon }: StatusBadgeProps) {
  const styles = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
    excellent: "bg-green-100 text-green-700",
    good: "bg-amber-100 text-amber-700",
    warning: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
  }

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {icon}
      {label}
    </span>
  )
}
