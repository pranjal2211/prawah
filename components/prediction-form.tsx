"use client"

import { useState } from "react"
import { Calendar, AlertTriangle, CheckCircle2, Cloud, Droplets, Thermometer } from "lucide-react"
const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

// TypeScript interface for backend response
interface PredictionResult {
  weather: {
    avg_temperature: number;
    avg_humidity: number;
    avg_rainfall: number;
    cities_sampled?: string[];
    sample_size?: number;
  };
  predicted_demand: number;
  confidence: number;
  min_demand: number;
  max_demand: number;
  state: string;
  date: string;
}

// Set your FastAPI backend URL here. If running locally, use http://localhost:8000
const BACKEND_URL = process.env.NEXT_PUBLIC_DEMAND_API_URL || "http://localhost:8000";

export default function PredictionForm() {
    // Helper to ensure date is always in YYYY-MM-DD
    function formatDateToISO(dateStr: string) {
      // If already in YYYY-MM-DD, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      // If in DD-MM-YYYY, convert
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        const [d, m, y] = dateStr.split('-');
        return `${y}-${m}-${d}`;
      }
      return dateStr;
    }
  // Get local date in YYYY-MM-DD format
  function getLocalDateString(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const today = new Date();
  const todayStr = getLocalDateString(today);
  const next7thDay = new Date(today);
  next7thDay.setDate(today.getDate() + 6);
  const next7thDayStr = getLocalDateString(next7thDay);
  
  const [formData, setFormData] = useState({
    state: "Maharashtra",
    date: todayStr, // always default to current date
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "date") {
      newValue = formatDateToISO(value);
    }
    setFormData({
      ...formData,
      [name]: newValue,
    });
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // Call the new predict_with_weather endpoint
      const response = await fetch(`http://localhost:8000/predict_with_weather`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: formData.state,
          date: formatDateToISO(formData.date)
        })
      });

      if (!response.ok) {
        let errorMessage = `Prediction failed (HTTP ${response.status})`;
        try {
          const errorData = await response.json();
          // Show the full error object for debugging if detail/message is missing
          if (errorData && (errorData.detail || errorData.message)) {
            errorMessage = errorData.detail || errorData.message;
          } else {
            errorMessage = JSON.stringify(errorData);
          }
        } catch (jsonErr) {
          // Not JSON, could be CORS or network error
          if (response.status === 0) {
            errorMessage = "Network error or CORS issue. Check if backend is running and CORS is enabled.";
          }
        }
        setError(errorMessage);
        return;
      }

      const data = await response.json();
      setPrediction({
        weather: {
          avg_temperature: data.weather.avg_temperature,
          avg_humidity: data.weather.avg_humidity,
          avg_rainfall: data.weather.avg_rainfall,
          cities_sampled: data.weather.cities_sampled,
          sample_size: data.weather.sample_size,
        },
        predicted_demand: data.predicted_demand,
        confidence: data.confidence || 90,
        min_demand: data.min_demand,
        max_demand: data.max_demand,
        state: data.state,
        date: data.date,
      });
    } catch (err) {
      let message = "Failed to get prediction. Make sure the backend is running on http://localhost:8000";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'object') {
        message = JSON.stringify(err);
      }
      setError(message);
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="max-w-7xl mx-auto animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-var(--primary-dark) mb-3 font-poppins">
          Electricity Demand Prediction
        </h1>
        <p className="text-lg text-var(--primary-dark)/70">
          Real-time weather-based electricity demand forecast powered by AI
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Panel */}
          <div className="lg:col-span-1">
            <form
              onSubmit={handleSubmit}
              className="glass rounded-2xl p-8 border border-white/20 sticky top-24 animate-slide-up"
            >
              <h2 className="text-xl font-bold text-var(--primary-dark) mb-6 font-poppins">
                Prediction Parameters
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-var(--primary-dark) text-sm font-semibold mb-2">
                    Select State
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full bg-white/30 border border-var(--accent)/20 text-var(--primary-dark) rounded-lg px-4 py-3 text-sm hover:bg-white/40 transition-smooth focus:outline-none focus:ring-2 focus:ring-var(--primary)/40 focus:border-var(--primary)"
                  >
                    {states.map((s) => (
                      <option key={s} value={s} className="bg-white text-var(--primary-dark)">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-var(--primary-dark) text-sm font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-var(--accent)" /> Select Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formatDateToISO(formData.date)}
                    onChange={handleInputChange}
                    min={todayStr}
                    max={next7thDayStr}
                    className="w-full bg-white/30 border border-var(--accent)/20 text-var(--primary-dark) rounded-lg px-4 py-3 text-sm hover:bg-white/40 transition-smooth focus:outline-none focus:ring-2 focus:ring-var(--primary)/40 focus:border-var(--primary)"
                  />
                  <p className="text-xs text-var(--primary-dark)/60 mt-2">Within the next 7 days</p>
                </div>

                <div className="bg-var(--soft)/30 rounded-lg p-4 border border-var(--accent)/20">
                  <p className="text-xs font-semibold text-var(--primary-dark) mb-2">📍 Data Source</p>
                  <p className="text-xs text-var(--primary-dark)/70 leading-relaxed">
                    Real-time weather data from multiple sources for accurate demand forecasting
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                style={{ background: "#EA7317" }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                      Fetching Data...
                    </>
                  ) : (
                    <>
                      Get Prediction
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="glass rounded-xl p-5 border border-red-200/50 bg-red-50/40 flex gap-4 animate-slide-up">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 font-semibold text-sm mb-1">Prediction Failed</p>
                  <p className="text-red-600 text-sm">{typeof error === 'string' ? error : JSON.stringify(error)}</p>
                </div>
              </div>
            )}

            {prediction ? (
              <>
                {/* Weather Cards */}
                <div className="glass rounded-2xl p-6 border border-white/20 animate-slide-up">
                  <h3 className="text-lg font-bold text-var(--primary-dark) mb-5 flex items-center gap-2 font-poppins">
                    <Cloud className="w-5 h-5 text-var(--accent)" /> Real-Time Weather Data
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass-dark rounded-xl p-5 border border-white/20 text-center">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Thermometer className="w-5 h-5 text-var(--accent)" />
                        <p className="text-var(--primary-dark) text-xs font-bold uppercase tracking-wide">Temp</p>
                      </div>
                      <p className="text-var(--primary) text-3xl font-bold font-poppins">{prediction.weather.avg_temperature}°C</p>
                    </div>
                    <div className="glass-dark rounded-xl p-5 border border-white/20 text-center">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Droplets className="w-5 h-5 text-var(--accent)" />
                        <p className="text-var(--primary-dark) text-xs font-bold uppercase tracking-wide">Humidity</p>
                      </div>
                      <p className="text-var(--primary) text-3xl font-bold font-poppins">{prediction.weather.avg_humidity}%</p>
                    </div>
                    <div className="glass-dark rounded-xl p-5 border border-white/20 text-center">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Cloud className="w-5 h-5 text-var(--accent)" />
                        <p className="text-var(--primary-dark) text-xs font-bold uppercase tracking-wide">Rain</p>
                      </div>
                      <p className="text-var(--primary) text-3xl font-bold font-poppins">{prediction.weather.avg_rainfall}mm</p>
                    </div>
                  </div>
                </div>

                {/* Prediction Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass rounded-2xl p-6 border border-white/20 animate-slide-up animate-delay-100">
                    <p className="text-var(--primary-dark)/70 text-sm font-medium mb-2">Predicted Demand</p>
                    <p className="text-var(--primary-dark) text-4xl font-bold mb-4 font-poppins">
                      {prediction.predicted_demand} MW
                    </p>
                    <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      {prediction.confidence}% Confidence
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-6 border border-white/20 animate-slide-up animate-delay-200">
                    <p className="text-var(--primary-dark)/70 text-sm font-medium mb-2">Expected Range</p>
                    <p className="text-var(--primary-dark) text-3xl font-bold mb-4 font-poppins">
                      {prediction.min_demand}–{prediction.max_demand} MW
                    </p>
                    <p className="text-var(--primary) text-sm font-medium">
                      ±{Math.round((prediction.max_demand - prediction.min_demand) / 2)} MW variation
                    </p>
                  </div>
                </div>

                {/* Success Message */}
                <div className="glass-dark rounded-xl p-5 border border-green-200/40 bg-green-50/30 flex gap-4 animate-slide-up animate-delay-300">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-700 font-semibold text-sm mb-1">Prediction Complete</p>
                    <p className="text-green-600 text-sm">
                      Forecast for <strong>{formData.state}</strong> on <strong>{formData.date}</strong>
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass rounded-2xl p-12 border border-white/20 flex items-center justify-center min-h-96 animate-slide-up">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Cloud className="w-10 h-10 text-var(--primary)" />
                  </div>
                  <p className="text-var(--primary-dark) text-xl font-semibold mb-2 font-poppins">
                    Ready for Prediction
                  </p>
                  <p className="text-var(--primary-dark)/70 text-sm max-w-xs">
                    Select your state and date, then click "Get Prediction" to fetch real-time weather data and forecast demand
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)