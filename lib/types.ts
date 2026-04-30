export interface DemandPrediction {
  id: string
  state: string
  date: string
  predictedDemand: number
  confidence: number
  minDemand: number
  maxDemand: number
  trend: "increasing" | "decreasing" | "stable"
  temperature: number
  humidity: number
  season: "Summer" | "Monsoon" | "Winter" | "Spring"
  dayType: "Weekday" | "Weekend" | "Holiday"
  industrialLoad: number
  createdAt: Date
}

export interface StateMetrics {
  state: string
  currentDemand: number
  peakDemand: number
  availableSupply: number
  trend: string
  status: "high" | "medium" | "low"
}

export interface ChartData {
  time: string
  demand?: number
  forecast?: number
  predicted?: number
  actual?: number
  [key: string]: string | number | undefined
}

export interface ShortageRiskData {
  state: string
  shortage_probability: number
  predicted_shortage_mw: number
  shortage_severity: "None" | "Low" | "Medium" | "High"
  risk_level: "Low" | "Medium" | "High"
  last_data_date: string
  current_season: string
}

export interface StateHistoricalData {
  state: string
  data_last_date: string
  historical: {
    total_days_in_data: number
    days_with_shortage: number
    shortage_rate_pct: number
    avg_shortage_mw: number
    max_shortage_mw: number
    avg_demand_mw: number
    peak_demand_mw: number
    worst_shortage_date: string
    season_most_at_risk: string
  }
  live_prediction: {
    shortage_predicted: boolean
    shortage_probability: number
    predicted_shortage_mw: number
    shortage_severity: "None" | "Low" | "Medium" | "High"
    risk_level: "Low" | "Medium" | "High"
    recommendation: string
  }
}

export interface NationalRiskSummary {
  total_states: number
  risk_summary: {
    High: number
    Medium: number
    Low: number
  }
  rankings: ShortageRiskData[]
}

export interface NationalSummary {
  date_range: { from: string; to: string }
  overall: {
    total_observations: number
    shortage_days: number
    shortage_rate_pct: number
    total_shortage_mw: number
    avg_shortage_mw: number
    max_shortage_mw: number
    worst_single_day: { date: string; state: string; mw: number }
  }
  by_season: Record<
    string,
    {
      avg_mw: number
      peak_mw: number
      rate: number
    }
  >
  top_5_risk_states: ShortageRiskData[]
}
