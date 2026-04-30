"use client"

import type React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricCardProps {
  label: string
  value: string
  change?: string
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
}

export function MetricCard({ label, value, change, trend = "neutral", icon }: MetricCardProps) {
  const trendColor = {
    up: "text-red-600",
    down: "text-green-600",
    neutral: "text-var(--accent)",
  }[trend]

  const trendIcon = {
    up: <TrendingUp className="w-4 h-4" />,
    down: <TrendingDown className="w-4 h-4" />,
    neutral: <Minus className="w-4 h-4" />,
  }[trend]

  return (
    <div className="glass rounded-xl p-6 border border-white/20 hover:border-var(--accent)/40 hover:shadow-lg transition-smooth group">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-var(--primary-dark)/70 font-medium">{label}</p>
        {icon && (
          <div className="text-var(--primary) group-hover:text-var(--accent) transition-smooth">
            {icon}
          </div>
        )}
      </div>
      <p className="text-var(--primary-dark) text-3xl font-bold mb-3 font-poppins">{value}</p>
      {change && (
        <div className={`${trendColor} text-sm font-medium flex items-center gap-1 transition-smooth`}>
          {trendIcon}
          {change}
        </div>
      )}
    </div>
  )
}
