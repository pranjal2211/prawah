"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, TrendingUp, Zap, Calendar, RefreshCw } from "lucide-react"
import shortage_api, { StateHistoricalData } from "@/lib/shortage-api-service"

interface StateDetailProps {
  state: string
}

export function StateShortageDetail({ state }: StateDetailProps) {
  const [data, setData] = useState<StateHistoricalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchStateDetail()
  }, [state])

  const fetchStateDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await shortage_api.getStateDetail(state)
      setData(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load state data"
      setError(message)
      console.error("Error fetching state detail:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchStateDetail()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="glass rounded-xl p-6 border border-white/20">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/20 rounded w-1/3"></div>
          <div className="h-24 bg-white/20 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass rounded-xl p-6 border border-red-400/50 bg-red-500/10 space-y-3">
        <p className="text-red-600 font-semibold">Failed to load state details</p>
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white text-sm rounded font-medium transition-colors"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Retrying..." : "Retry"}
        </button>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "High":
        return "text-red-600"
      case "Medium":
        return "text-yellow-600"
      case "Low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getRiskBg = (riskLevel: string) => {
    switch (riskLevel) {
      case "High":
        return "bg-red-500/20 border-red-400/50"
      case "Medium":
        return "bg-yellow-500/20 border-yellow-400/50"
      case "Low":
        return "bg-green-500/20 border-green-400/50"
      default:
        return "bg-gray-500/20 border-gray-400/50"
    }
  }

  const { historical, live_prediction } = data

  return (
    <div className="space-y-6">
      {/* Live Prediction Card */}
      <div className={`glass rounded-xl p-6 border transition-smooth ${getRiskBg(live_prediction.risk_level)}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-var(--primary-dark) font-poppins">{state}</h3>
            <p className="text-sm text-var(--primary-dark)/70 mt-1">Current Risk Assessment</p>
          </div>
          <div className={`px-3 py-1 rounded-lg font-semibold ${getRiskColor(live_prediction.risk_level)}`}>
            {live_prediction.risk_level}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-var(--primary-dark)/60">Risk Probability</p>
            <p className="text-2xl font-bold text-var(--primary-dark)">
              {(live_prediction.shortage_probability * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-var(--primary-dark)/60">Predicted Shortage</p>
            <p className="text-2xl font-bold text-var(--primary-dark)">{live_prediction.predicted_shortage_mw} MW</p>
          </div>
        </div>

        <div className="p-4 bg-white/10 rounded-lg border border-white/20">
          <p className="text-sm text-var(--primary-dark)/80">{live_prediction.recommendation}</p>
        </div>
      </div>

      {/* Historical Stats Grid */}
      <div className="glass rounded-xl p-6 border border-white/20 hover:shadow-lg transition-smooth">
        <h4 className="text-lg font-semibold text-var(--primary-dark) mb-4 font-poppins">Historical Statistics</h4>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/10 rounded-lg border border-white/20">
            <p className="text-xs text-var(--primary-dark)/60 mb-1">Shortage Rate</p>
            <p className="text-2xl font-bold text-var(--primary-dark)">{historical.shortage_rate_pct}%</p>
            <p className="text-xs text-var(--primary-dark)/70 mt-1">
              {historical.days_with_shortage}/{historical.total_days_in_data} days
            </p>
          </div>

          <div className="p-4 bg-white/10 rounded-lg border border-white/20">
            <p className="text-xs text-var(--primary-dark)/60 mb-1">Avg Shortage</p>
            <p className="text-2xl font-bold text-var(--primary-dark)">{historical.avg_shortage_mw} MW</p>
          </div>

          <div className="p-4 bg-white/10 rounded-lg border border-white/20">
            <p className="text-xs text-var(--primary-dark)/60 mb-1">Max Shortage</p>
            <p className="text-2xl font-bold text-var(--primary-dark)">{historical.max_shortage_mw} MW</p>
          </div>

          <div className="p-4 bg-white/10 rounded-lg border border-white/20">
            <p className="text-xs text-var(--primary-dark)/60 mb-1">Avg Demand</p>
            <p className="text-2xl font-bold text-var(--primary-dark)">{historical.avg_demand_mw} MW</p>
          </div>

          <div className="p-4 bg-white/10 rounded-lg border border-white/20">
            <p className="text-xs text-var(--primary-dark)/60 mb-1">Peak Demand</p>
            <p className="text-2xl font-bold text-var(--primary-dark)">{historical.peak_demand_mw} MW</p>
          </div>

          <div className="p-4 bg-white/10 rounded-lg border border-white/20">
            <p className="text-xs text-var(--primary-dark)/60 mb-1">High Risk Season</p>
            <p className="text-lg font-bold text-var(--primary-dark)">{historical.season_most_at_risk}</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white/10 rounded-lg border border-white/20">
          <p className="text-xs text-var(--primary-dark)/60 mb-1">Worst Shortage Date</p>
          <p className="text-lg font-bold text-var(--primary-dark)">{historical.worst_shortage_date}</p>
        </div>
      </div>
    </div>
  )
}
