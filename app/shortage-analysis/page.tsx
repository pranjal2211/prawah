"use client"

import { useState, useEffect, useMemo } from "react"
import { ShortageRiskChart } from "@/components/shortage-risk-chart"
import { StateShortageDetail } from "@/components/state-shortage-detail"
import ShortagePredictionForm from "@/components/shortage-prediction-form"
import { AlertTriangle, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import shortage_api, { NationalRiskResponse, NationalSummaryResponse } from "@/lib/shortage-api-service"

export default function ShortageAnalysisPage() {
  const [nationalData, setNationalData] = useState<NationalRiskResponse | null>(null)
  const [summary, setSummary] = useState<NationalSummaryResponse | null>(null)
  const [allStates, setAllStates] = useState<string[]>([])
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "analysis" | "details" | "prediction">("overview")

  // Fetch national data and summary on mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [riskData, summaryData, statesData] = await Promise.all([
        shortage_api.getNationalRisk(),
        shortage_api.getNationalSummary(),
        shortage_api.getStates(),
      ])

      setNationalData(riskData)
      setSummary(summaryData)
      setAllStates(statesData)

      // Set default selected state to first high-risk state
      if (riskData.rankings.length > 0) {
        setSelectedState(riskData.rankings[0].state)
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load shortage analysis data. Please ensure the API server is running."
      setError(message)
      console.error("Error fetching shortage data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  const highRiskStates = useMemo(() => {
    return nationalData?.rankings.filter((r) => r.risk_level === "High") || []
  }, [nationalData])

  const mediumRiskStates = useMemo(() => {
    return nationalData?.rankings.filter((r) => r.risk_level === "Medium") || []
  }, [nationalData])

  const lowRiskStates = useMemo(() => {
    return nationalData?.rankings.filter((r) => r.risk_level === "Low") || []
  }, [nationalData])

  const getSeasonColor = (season: string) => {
    const colors: Record<string, string> = {
      Summer: "text-orange-600",
      Monsoon: "text-blue-600",
      "Post-Monsoon": "text-amber-600",
      Winter: "text-cyan-600",
    }
    return colors[season] || "text-gray-600"
  }

  if (loading) {
    return (
      <main className="min-h-screen gradient-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-white/20 rounded w-1/3"></div>
            <div className="grid md:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-24 bg-white/20 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen gradient-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="glass rounded-xl p-6 border border-red-400/50 bg-red-500/10 space-y-4">
            <div>
              <p className="text-red-600 font-semibold mb-2">⚠️ Error Loading Data</p>
              <p className="text-red-500 text-sm mb-2">{error}</p>
              <p className="text-red-500/70 text-xs">
                <strong>Setup required:</strong> Ensure the FastAPI server is running with:
              </p>
              <code className="text-xs text-red-600 bg-red-900/20 p-2 rounded block mt-2 overflow-x-auto">
                cd backend && python -m uvicorn shortage_api:app --reload --host 127.0.0.1 --port 8001
              </code>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg font-medium transition-colors"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Retrying..." : "Try Again"}
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen gradient-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header with Refresh */}
        <div className="mb-12 animate-fade-in flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-var(--primary-dark) mb-2 font-poppins">
              ⚡ Shortage Analysis & Forecasts
            </h1>
            <p className="text-var(--primary-dark)/70">
              Real-time analysis of electricity shortages across Indian states using ML predictions
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-var(--primary-dark) rounded-lg font-medium transition-colors"
            title="Refresh all data"
          >
            <RefreshCw size={18} className={refreshing || loading ? "animate-spin" : ""} />
            {refreshing ? "Updating..." : "Refresh"}
          </button>
        </div>

        {/* National Summary Cards */}
        {summary && (
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <div className="glass rounded-lg p-4 border border-white/20 animate-slide-up">
              <div className="text-2xl mb-2">⚠️</div>
              <p className="text-xs text-var(--primary-dark)/60 mb-1">Total Shortage (Historical)</p>
              <p className="text-2xl font-bold text-var(--primary-dark) font-poppins">
                {Math.round(summary.overall.total_shortage_mw / 1000)}K MW
              </p>
            </div>

            <div className="glass rounded-lg p-4 border border-white/20 animate-slide-up" style={{ animationDelay: "75ms" }}>
              <div className="text-2xl mb-2">🔴</div>
              <p className="text-xs text-var(--primary-dark)/60 mb-1">High Risk States</p>
              <p className="text-2xl font-bold text-var(--primary-dark) font-poppins">
                {nationalData?.risk_summary.High || 0}
              </p>
            </div>

            <div className="glass rounded-lg p-4 border border-white/20 animate-slide-up" style={{ animationDelay: "150ms" }}>
              <div className="text-2xl mb-2">📊</div>
              <p className="text-xs text-var(--primary-dark)/60 mb-1">Shortage Rate</p>
              <p className="text-2xl font-bold text-var(--primary-dark) font-poppins">
                {summary.overall.shortage_rate_pct}%
              </p>
            </div>

            <div className="glass rounded-lg p-4 border border-white/20 animate-slide-up" style={{ animationDelay: "225ms" }}>
              <div className="text-2xl mb-2">📈</div>
              <p className="text-xs text-var(--primary-dark)/60 mb-1">Peak Shortage</p>
              <p className="text-2xl font-bold text-var(--primary-dark) font-poppins">
                {Math.round(summary.overall.max_shortage_mw)} MW
              </p>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {nationalData && <ShortageRiskChart data={nationalData.rankings} title="Top 15 States by Risk Level" />}

          {/* Top Risk Details */}
          {summary && (
            <div className="glass rounded-xl p-6 border border-white/20 hover:shadow-lg transition-smooth space-y-4">
              <h3 className="text-lg font-semibold text-var(--primary-dark) font-poppins">📍 National Insights</h3>

              <div className="space-y-3">
                <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                  <p className="text-xs text-var(--primary-dark)/60 mb-1">Worst Shortage Event</p>
                  <p className="text-sm font-semibold text-var(--primary-dark)">
                    {summary.overall.worst_single_day.state} on {summary.overall.worst_single_day.date}
                  </p>
                  <p className="text-xs text-var(--primary-dark)/70 mt-1">
                    {summary.overall.worst_single_day.mw} MW shortage
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-var(--primary-dark)/60 font-semibold mb-2">Shortage by Season</p>
                  {Object.entries(summary.by_season).map(([season, data]) => (
                    <div key={season} className="flex justify-between items-center p-2 bg-white/10 rounded">
                      <span className={`text-sm font-medium ${getSeasonColor(season)}`}>{season}</span>
                      <div className="text-right">
                        <p className="text-xs text-var(--primary-dark)/60">{(data.rate * 100).toFixed(1)}% rate</p>
                        <p className="text-sm font-semibold text-var(--primary-dark)">{data.avg_mw} MW avg</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="glass rounded-xl border border-white/20 overflow-hidden mb-12">
          <div className="flex border-b border-white/20">
            {[
              { id: "overview", label: "📊 Overview", icon: "📊" },
              { id: "analysis", label: "📈 Analysis", icon: "📈" },
              { id: "prediction", label: "⚡ Prediction", icon: "⚡" },
              { id: "details", label: "🔍 Details", icon: "🔍" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-all ${
                  activeTab === tab.id
                    ? "text-var(--primary-dark) border-b-2 border-var(--accent) bg-white/20"
                    : "text-var(--primary-dark)/60 hover:text-var(--primary-dark) hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="p-8 space-y-8">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="glass rounded-lg p-4 border border-white/20 bg-red-500/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-var(--primary-dark)/60 mb-1">High Risk States</p>
                      <p className="text-3xl font-bold text-red-600 font-poppins">{nationalData?.risk_summary.High || 0}</p>
                    </div>
                    <AlertTriangle className="text-red-600" size={24} />
                  </div>
                </div>
                <div className="glass rounded-lg p-4 border border-white/20 bg-orange-500/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-var(--primary-dark)/60 mb-1">Medium Risk States</p>
                      <p className="text-3xl font-bold text-orange-600 font-poppins">{nationalData?.risk_summary.Medium || 0}</p>
                    </div>
                    <AlertCircle className="text-orange-600" size={24} />
                  </div>
                </div>
                <div className="glass rounded-lg p-4 border border-white/20 bg-green-500/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-var(--primary-dark)/60 mb-1">Low Risk States</p>
                      <p className="text-3xl font-bold text-green-600 font-poppins">{nationalData?.risk_summary.Low || 0}</p>
                    </div>
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {nationalData && <ShortageRiskChart data={nationalData.rankings} title="Top 15 States by Risk Level" />}

                {summary && (
                  <div className="glass rounded-xl p-6 border border-white/20 space-y-4">
                    <h3 className="text-lg font-semibold text-var(--primary-dark) font-poppins">📍 National Summary</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-white/10 rounded-lg">
                        <p className="text-xs text-var(--primary-dark)/60 mb-1">Total States Analyzed</p>
                        <p className="text-xl font-bold text-var(--primary-dark)">{nationalData?.total_states || 0}</p>
                      </div>
                      <div className="p-3 bg-white/10 rounded-lg">
                        <p className="text-xs text-var(--primary-dark)/60 mb-1">Average Risk Probability</p>
                        <p className="text-xl font-bold text-var(--primary-dark)">
                          {(
                            (nationalData?.rankings.reduce((sum, r) => sum + r.shortage_probability, 0) || 0) /
                            (nationalData?.total_states || 1)
                          ).toFixed(1)}
                        </p>
                      </div>
                      <div className="p-3 bg-white/10 rounded-lg">
                        <p className="text-xs text-var(--primary-dark)/60 mb-1">Total Predicted Shortage</p>
                        <p className="text-xl font-bold text-var(--primary-dark)">
                          {(nationalData?.rankings.reduce((sum, r) => sum + r.predicted_shortage_mw, 0) || 0).toLocaleString()} MW
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === "analysis" && (
            <div className="p-8 space-y-8">
              {highRiskStates.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-var(--primary-dark) font-poppins">⛔ HIGH RISK STATES</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20 bg-white/10">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-var(--primary-dark)">State</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-var(--primary-dark)">Risk %</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-var(--primary-dark)">Predicted Shortage</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-var(--primary-dark)">Season</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-var(--primary-dark)">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {highRiskStates.slice(0, 10).map((state, idx) => (
                          <tr key={idx} className="border-b border-white/10 hover:bg-red-500/10 transition-smooth">
                            <td className="px-6 py-4 font-medium text-var(--primary-dark)">{state.state}</td>
                            <td className="px-6 py-4 font-semibold text-red-600">{(state.shortage_probability * 100).toFixed(1)}%</td>
                            <td className="px-6 py-4 text-var(--primary-dark)">{state.predicted_shortage_mw} MW</td>
                            <td className="px-6 py-4 text-var(--primary-dark) text-sm">{state.current_season}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setSelectedState(state.state)}
                                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                              >
                                View →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {mediumRiskStates.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-var(--primary-dark) font-poppins">🟠 MEDIUM RISK STATES</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mediumRiskStates.map((state, idx) => (
                      <div key={idx} className="glass rounded-lg p-4 border border-white/20 hover:shadow-lg transition-smooth cursor-pointer" onClick={() => setSelectedState(state.state)}>
                        <p className="font-semibold text-var(--primary-dark) mb-2">{state.state}</p>
                        <div className="space-y-1 text-sm">
                          <p className="text-var(--primary-dark)/70">Risk: <span className="font-semibold text-orange-600">{(state.shortage_probability * 100).toFixed(1)}%</span></p>
                          <p className="text-var(--primary-dark)/70">Shortage: <span className="font-semibold">{state.predicted_shortage_mw} MW</span></p>
                          <p className="text-var(--primary-dark)/70">Season: <span className="font-semibold">{state.current_season}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Prediction Tab */}
          {activeTab === "prediction" && (
            <div className="p-8">
              <ShortagePredictionForm />
            </div>
          )}

          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="p-8 space-y-8">
              <div className="glass rounded-xl p-6 border border-white/20">
                <label className="block text-sm font-semibold text-var(--primary-dark) mb-3">
                  📍 Select State for Detailed Analysis
                </label>
                <select
                  value={selectedState || ""}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-var(--primary-dark) font-medium focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20"
                >
                  <option value="">Select a state...</option>
                  {allStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {selectedState && <StateShortageDetail state={selectedState} />}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="glass rounded-xl p-4 border border-white/20 bg-white/5">
          <p className="text-xs text-var(--primary-dark)/70">
            💡 <strong>Data Source:</strong> Historical electricity grid data from 2023-2026 • <strong>Model:</strong> ML-based shortage prediction • <strong>Update Frequency:</strong> Real-time API
          </p>
        </div>
      </div>
    </main>
  )
}
