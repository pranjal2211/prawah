"use client"

import { useState } from "react"
import { Calendar, AlertTriangle, CheckCircle2, Cloud, Droplets, Thermometer, Zap } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_SHORTAGE_API_URL || "http://localhost:8001"

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
]

interface ShortageResult {
  state: string
  date: string
  shortage_probability: number
  predicted_shortage_mw: number
  shortage_severity: "None" | "Low" | "Medium" | "High"
  risk_level: "Low" | "Medium" | "High"
  weather: {
    avg_temperature: number
    avg_humidity: number
    avg_rainfall: number
  }
  recommendation: string
}

export default function ShortagePredictionForm() {
  function formatDateToISO(dateStr: string) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split("-")
      return `${y}-${m}-${d}`
    }
    return dateStr
  }

  function getLocalDateString(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const today = new Date()
  const todayStr = getLocalDateString(today)
  const next7thDay = new Date(today)
  next7thDay.setDate(today.getDate() + 6)
  const next7thDayStr = getLocalDateString(next7thDay)

  const [formData, setFormData] = useState({
    state: "Maharashtra",
    date: todayStr,
  })

  const [result, setResult] = useState<ShortageResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    let newValue = value
    if (name === "date") {
      newValue = formatDateToISO(value)
    }
    setFormData({
      ...formData,
      [name]: newValue,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Call the shortage API prediction endpoint
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state: formData.state,
          date: formatDateToISO(formData.date),
        }),
      })

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`
        try {
          const errorData = await response.json()
          if (typeof errorData === "string") {
            errorMessage = errorData
          } else if (errorData.detail) {
            errorMessage = errorData.detail
          } else if (Array.isArray(errorData)) {
            errorMessage = errorData.map((e: any) => e.msg || e.detail || JSON.stringify(e)).join(", ")
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch (parseErr) {
          // Response is not JSON, likely HTML error page
          errorMessage = `API Error ${response.status}: Is the backend server running on port 8001?`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred while fetching data"
      setError(message)
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "High":
        return "text-red-600 bg-red-500/10"
      case "Medium":
        return "text-orange-600 bg-orange-500/10"
      case "Low":
        return "text-green-600 bg-green-500/10"
      default:
        return "text-gray-600 bg-gray-500/10"
    }
  }

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "bg-red-500/20 text-red-700 border-red-400/50"
      case "Medium":
        return "bg-orange-500/20 text-orange-700 border-orange-400/50"
      case "Low":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-400/50"
      case "None":
        return "bg-green-500/20 text-green-700 border-green-400/50"
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-400/50"
    }
  }

  return (
    <main className="min-h-screen gradient-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold text-var(--primary-dark) mb-2 font-poppins">
             Shortage Prediction Form
          </h2>
          <p className="text-var(--primary-dark)/70">
            Select a state and date to get live weather-based shortage predictions with ML model insights
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Form Section */}
          <div className="md:col-span-1">
            <div className="glass rounded-2xl p-8 shadow-lg border border-white/20 backdrop-blur-md sticky top-24">
              <h3 className="text-2xl font-bold text-var(--primary-dark) mb-6 font-poppins">Prediction Form</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-lg bg-red-50/80 border border-red-200 flex gap-3 animate-slide-up">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                {/* State Selection */}
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-semibold text-var(--primary-dark)">
                     Select State
                  </label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/50 border-white/20 focus:border-var(--accent) focus:ring-2 focus:ring-var(--accent)/20 transition-smooth font-medium text-var(--primary-dark) disabled:opacity-50 cursor-pointer"
                  >
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                  <label htmlFor="date" className="text-sm font-semibold text-var(--primary-dark) flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Select Date
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    disabled={loading}
                    min={todayStr}
                    max={next7thDayStr}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/50 border border-white/20 focus:border-var(--accent) focus:ring-2 focus:ring-var(--accent)/20 transition-smooth text-var(--primary-dark) font-medium disabled:opacity-50 cursor-pointer"
                  />
                  <p className="text-xs text-var(--primary-dark)/60">
                    Predictions available for today and next 7 days
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                style={{ background: "#EA7317" }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 " />
                      Get Prediction
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results Section */}
          <div className="md:col-span-2">
            {result ? (
              <div className="space-y-6 animate-fade-in">
                {/* Header Card */}
                <div className={`glass rounded-2xl p-6 border border-white/20 ${getRiskColor(result.risk_level)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold mb-2">{result.state}</h4>
                      <p className="text-sm opacity-70">{result.date}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border font-semibold text-sm ${getSeverityBadgeColor(result.shortage_severity)}`}>
                      {result.shortage_severity} Severity
                    </div>
                  </div>
                </div>

                {/* Risk Level Card */}
                <div className="glass rounded-2xl p-6 border border-white/20">
                  <h4 className="font-semibold text-var(--primary-dark) mb-4 font-poppins">Risk Assessment</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/20 rounded-lg">
                      <span className="font-medium text-var(--primary-dark)">Risk Probability</span>
                      <span className="text-2xl font-bold text-var(--accent)">
                        {(result.shortage_probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/20 rounded-lg">
                      <span className="font-medium text-var(--primary-dark)">Predicted Shortage</span>
                      <span className="text-2xl font-bold text-red-600">{result.predicted_shortage_mw} MW</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/20 rounded-lg">
                      <span className="font-medium text-var(--primary-dark)">Risk Level</span>
                      <span className={`px-3 py-1 rounded-full font-semibold text-sm ${getSeverityBadgeColor(result.risk_level)}`}>
                        {result.risk_level}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Weather Data */}
                <div className="glass rounded-2xl p-6 border border-white/20">
                  <h4 className="font-semibold text-var(--primary-dark) mb-4 font-poppins">Weather Conditions</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-white/20 rounded-lg text-center">
                      <Thermometer className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                      <p className="text-xs text-var(--primary-dark)/70 mb-1">Temperature</p>
                      <p className="font-bold text-var(--primary-dark)">{result.weather.avg_temperature.toFixed(1)}°C</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg text-center">
                      <Droplets className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-xs text-var(--primary-dark)/70 mb-1">Humidity</p>
                      <p className="font-bold text-var(--primary-dark)">{result.weather.avg_humidity.toFixed(1)}%</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg text-center">
                      <Cloud className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                      <p className="text-xs text-var(--primary-dark)/70 mb-1">Rainfall</p>
                      <p className="font-bold text-var(--primary-dark)">{result.weather.avg_rainfall.toFixed(1)} mm</p>
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="glass rounded-2xl p-6 border border-white/20 bg-blue-500/10">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-var(--primary-dark) mb-2">Recommendation</h4>
                      <p className="text-sm text-var(--primary-dark)/80 leading-relaxed">{result.recommendation}</p>
                    </div>
                  </div>
                </div>

                {/* Model Info */}
                <div className="glass rounded-xl p-4 border border-white/20 bg-white/5">
                  <p className="text-xs text-var(--primary-dark)/70">
                    💡 <strong>Prediction Model:</strong> weather_demand_model_final.ipynb • <strong>Weather API:</strong> weatherapi.com • <strong>Correlation:</strong> Temperature, Humidity, Rainfall impact on electricity demand
                  </p>
                </div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-8 border border-white/20 h-full flex items-center justify-center">
                <div className="text-center">
                  <Zap className="w-16 h-16 mx-auto mb-4 text-var(--accent)/30" />
                  <p className="text-var(--primary-dark)/60 font-medium">
                    Select a state and date, then click "Get Prediction" to see results
                  </p>
                  <p className="text-xs text-var(--primary-dark)/40 mt-2">
                    The prediction will include live weather data and ML-based shortage analysis
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
