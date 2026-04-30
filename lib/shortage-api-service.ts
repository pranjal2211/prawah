/**
 * Shortage API Service
 * Centralized service for all shortage prediction API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_SHORTAGE_API_URL || "http://localhost:8001"

// Types
export interface ShortageRiskData {
  state: string
  shortage_probability: number
  predicted_shortage_mw: number
  shortage_severity: "None" | "Low" | "Medium" | "High"
  risk_level: "Low" | "Medium" | "High"
  last_data_date: string
  current_season: string
}

export interface NationalRiskResponse {
  total_states: number
  risk_summary: {
    High: number
    Medium: number
    Low: number
  }
  rankings: ShortageRiskData[]
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

export interface StateHistoryData {
  state: string
  days_returned: number
  shortage_days: number
  history: Array<{
    Date: string
    Max_Demand_Met_MW: number
    Shortage_MW: number
    Temp_Max: number
    Humidity: number
    Rainfall: number
    Season: string
    shortage_flag: number
    shortage_severity: string
  }>
}

export interface RiskCalendarData {
  state: string
  projection_days: number
  high_risk_days: number
  high_risk_dates: string[]
  calendar: Array<{
    date: string
    day_of_week: string
    season: string
    shortage_probability: number
    predicted_shortage_mw: number
    shortage_severity: string
    risk_level: string
  }>
}

export interface NationalSummaryResponse {
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

export interface StatesListResponse {
  count: number
  states: string[]
}

export interface HealthCheckResponse {
  status: string
  classifier_loaded: boolean
  regressor_loaded: boolean
  raw_data_loaded: boolean
  raw_data_rows: number
  available_states: number
  model_features: string[]
}

// Error handling
class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = "APIError"
  }
}

// API Service
const shortage_api = {
  /**
   * Check API health status
   */
  async getHealth(): Promise<HealthCheckResponse> {
    return fetch_api("/health")
  },

  /**
   * Get list of all available states
   */
  async getStates(): Promise<string[]> {
    const response = await fetch_api<StatesListResponse>("/states")
    return response.states
  },

  /**
   * Get national risk rankings for all states
   */
  async getNationalRisk(limit?: number, season?: string): Promise<NationalRiskResponse> {
    const params = new URLSearchParams()
    if (limit) params.append("limit", limit.toString())
    if (season) params.append("season", season)

    const url = `/national/risk${params.size > 0 ? `?${params}` : ""}`
    return fetch_api<NationalRiskResponse>(url)
  },

  /**
   * Get top risk states
   */
  async getTopRiskStates(limit: number = 5): Promise<NationalRiskResponse> {
    return fetch_api<NationalRiskResponse>(`/national/top_risk?limit=${limit}`)
  },

  /**
   * Get national summary statistics
   */
  async getNationalSummary(): Promise<NationalSummaryResponse> {
    return fetch_api<NationalSummaryResponse>("/national/summary")
  },

  /**
   * Get detailed information for a specific state
   */
  async getStateDetail(state: string): Promise<StateHistoricalData> {
    return fetch_api<StateHistoricalData>(`/state/${encodeURIComponent(state)}`)
  },

  /**
   * Get historical shortage data for a state
   */
  async getStateHistory(state: string, days: number = 90): Promise<StateHistoryData> {
    return fetch_api<StateHistoryData>(
      `/state/${encodeURIComponent(state)}/history?days=${Math.min(900, Math.max(7, days))}`
    )
  },

  /**
   * Get risk calendar (forecast) for a state
   */
  async getStateRiskCalendar(state: string, days: number = 30): Promise<RiskCalendarData> {
    return fetch_api<RiskCalendarData>(
      `/state/${encodeURIComponent(state)}/risk_calendar?days=${Math.min(90, Math.max(7, days))}`
    )
  },

  /**
   * Get severity breakdown statistics
   */
  async getSeverityBreakdown() {
    return fetch_api("/severity_breakdown")
  },
}

/**
 * Helper function to make API calls with error handling
 */
async function fetch_api<T = any>(endpoint: string): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      let errorDetails
      try {
        errorDetails = await response.json()
      } catch {
        errorDetails = { detail: response.statusText }
      }

      throw new APIError(response.status, `API request failed: ${response.statusText}`, errorDetails)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }

    // Network error or other issues
    throw new APIError(
      0,
      error instanceof Error ? error.message : "Failed to connect to Shortage API. Please ensure the backend server is running.",
      error
    )
  }
}

export default shortage_api
