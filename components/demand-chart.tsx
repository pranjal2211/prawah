"use client"

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export function DemandChart({ data, title = "Electricity Demand" }) {
  return (
    <div className="bg-white border border-amber-300 rounded-lg p-6">
      <h3 className="text-gray-800 font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis dataKey="time" stroke="rgba(0,0,0,0.6)" />
          <YAxis stroke="rgba(0,0,0,0.6)" />
          <Tooltip
            contentStyle={{ backgroundColor: "rgba(242, 233, 228, 0.95)", border: "1px solid rgba(217, 119, 6, 0.5)" }}
          />
          <Legend wrapperStyle={{ color: "rgba(0,0,0,0.7)" }} />
          <Area
            type="monotone"
            dataKey="demand"
            stroke="#ea580c"
            fillOpacity={1}
            fill="url(#colorDemand)"
            name="Demand"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ComparisonChart({ data, title = "Comparison", dataKey1, dataKey2, label1, label2 }) {
  return (
    <div className="bg-white border border-amber-300 rounded-lg p-6">
      <h3 className="text-gray-800 font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis dataKey="time" stroke="rgba(0,0,0,0.6)" />
          <YAxis stroke="rgba(0,0,0,0.6)" />
          <Tooltip
            contentStyle={{ backgroundColor: "rgba(242, 233, 228, 0.95)", border: "1px solid rgba(217, 119, 6, 0.5)" }}
          />
          <Legend wrapperStyle={{ color: "rgba(0,0,0,0.7)" }} />
          <Line type="monotone" dataKey={dataKey1} stroke="#ea580c" name={label1} />
          <Line type="monotone" dataKey={dataKey2} stroke="#f59e0b" name={label2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DistributionChart({ data, title = "Distribution" }) {
  return (
    <div className="bg-white border border-amber-300 rounded-lg p-6">
      <h3 className="text-gray-800 font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis dataKey="name" stroke="rgba(0,0,0,0.6)" />
          <YAxis stroke="rgba(0,0,0,0.6)" />
          <Tooltip
            contentStyle={{ backgroundColor: "rgba(242, 233, 228, 0.95)", border: "1px solid rgba(217, 119, 6, 0.5)" }}
          />
          <Legend wrapperStyle={{ color: "rgba(0,0,0,0.7)" }} />
          <Bar dataKey="value" fill="#ea580c" name="Value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
