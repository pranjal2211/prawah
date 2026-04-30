"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts"

interface RiskData {
  state: string
  shortage_probability: number
  predicted_shortage_mw: number
  shortage_severity: string
  risk_level: string
}

interface ChartProps {
  data: RiskData[]
  title?: string
  type?: "bar" | "line"
}

const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case "High":
      return "#ef4444"
    case "Medium":
      return "#f59e0b"
    case "Low":
      return "#10b981"
    default:
      return "#6b7280"
  }
}

export function ShortageRiskChart({ data, title = "Risk Levels by State", type = "bar" }: ChartProps) {
  const chartData = useMemo(() => {
    return data
      .sort((a, b) => b.shortage_probability - a.shortage_probability)
      .slice(0, 15)
      .map((item) => ({
        state: item.state.split(" ")[0], // Shorten state names for chart
        risk: Number((item.shortage_probability * 100).toFixed(1)),
        shortage: Math.round(item.predicted_shortage_mw),
        fullState: item.state,
        riskLevel: item.risk_level,
      }))
  }, [data])

  return (
    <div className="glass rounded-xl p-6 border border-white/20 hover:shadow-lg transition-smooth w-full">
      <h3 className="text-lg font-semibold text-var(--primary-dark) mb-4 font-poppins">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="state" stroke="rgba(0,0,0,0.6)" angle={-45} textAnchor="end" height={80} />
          <YAxis stroke="rgba(0,0,0,0.6)" label={{ value: "Risk (%)", angle: -90, position: "insideLeft" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.95)",
              border: "1px solid rgba(0,0,0,0.2)",
              borderRadius: "8px",
            }}
            formatter={(value, name) => {
              if (name === "risk") return [`${value}%`, "Risk Probability"]
              if (name === "shortage") return [`${value} MW`, "Predicted Shortage"]
              return [value, name]
            }}
            labelFormatter={(label) => `State: ${label}`}
          />
          <Bar dataKey="risk" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getRiskColor(entry.riskLevel)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ShortageTimelineChart({
  data,
  title = "Shortage Forecast Timeline",
}: {
  data: Array<{ date: string; shortageProb: number; shortage: number; riskLevel: string }>
  title?: string
}) {
  return (
    <div className="glass rounded-xl p-6 border border-white/20 hover:shadow-lg transition-smooth w-full">
      <h3 className="text-lg font-semibold text-var(--primary-dark) mb-4 font-poppins">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" stroke="rgba(0,0,0,0.6)" />
          <YAxis stroke="rgba(0,0,0,0.6)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.95)",
              border: "1px solid rgba(0,0,0,0.2)",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="shortageProb"
            stroke="#ef4444"
            name="Risk Probability"
            strokeWidth={2}
            dot={{ fill: "#ef4444", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="shortage"
            stroke="#f59e0b"
            name="Predicted Shortage (MW)"
            strokeWidth={2}
            dot={{ fill: "#f59e0b", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
