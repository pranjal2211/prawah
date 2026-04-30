# Shortage Analysis Implementation Guide

## Overview
The shortage analysis page visualizes electricity shortage predictions for Indian states using real-time data from the shortage_api.py backend.

## Components Created

### 1. **shortage-analysis/page.tsx** (Updated)
- Client-side page component with full API integration
- Fetches national risk data, state-level predictions, and historical statistics
- Features:
  - National summary cards showing key metrics
  - Bar chart of top 15 states by risk level
  - National insights and seasonal breakdown
  - High-risk states table (clickable rows)
  - State selector dropdown for detailed analysis
  - Loading and error states

### 2. **shortage-risk-chart.tsx** (New Component)
- Visualization components using Recharts library
- `ShortageRiskChart`: Bar chart showing top states by risk level
  - Color-coded by risk level (High/Medium/Low)
  - Shows both risk probability and predicted shortage
  - Sorts by highest risk first
- `ShortageTimelineChart`: Line chart for forecast timelines

### 3. **state-shortage-detail.tsx** (New Component)
- Displays detailed shortage analysis for a selected state
- Features:
  - Live prediction card with current risk assessment
  - Historical statistics grid (8 metrics)
  - Recommendation text based on risk level
  - Color-coded risk levels
  - Loading and error handling

### 4. **lib/types.ts** (Updated)
Added TypeScript interfaces:
- `ShortageRiskData`: Individual state risk information
- `StateHistoricalData`: Historical and current prediction data
- `NationalRiskSummary`: National risk rankings
- `NationalSummary`: Aggregated national statistics

## API Endpoints Used

The page connects to these shortage_api.py endpoints:

1. `/national/risk` - Get risk rankings for all states
2. `/national/summary` - Get aggregated national statistics
3. `/states` - Get list of all available states
4. `/state/{state}` - Get detailed data for a specific state

## Running the Application

### Start the Backend API
```bash
cd electricity-demand-prediction-app
python -m uvicorn backend.shortage_api:app --reload --host 127.0.0.1 --port 8001
```

### Start the Next.js Frontend
```bash
npm run dev
# or
pnpm dev
```

### Access the Shortage Analysis Page
Navigate to: `http://localhost:3000/shortage-analysis`

## Features

### National Dashboard
- **Summary Cards**: Total shortage, high-risk states count, shortage rate, peak shortage
- **Risk Rankings Chart**: Bar chart showing top 15 states by risk level
- **National Insights**: Worst shortage event, seasonal breakdown

### High-Risk States Table
- Lists all high-risk states (risk_level = "High")
- Shows risk probability, predicted shortage, and severity
- Clickable rows to view state details
- Limited to top 10 for readability

### State Selector & Details
- Dropdown to select any state from all 35 available states
- Detailed breakdown with:
  - Live prediction with risk level and recommendation
  - Historical statistics (shortage rate, avg/max shortage, demand metrics)
  - Season with highest historical risk

### Data Refresh
- Data loads automatically on page mount
- Manual refresh by reloading the page
- Real-time updates when different states are selected

## Styling

- Uses existing app theme variables (`--primary-dark`, `--primary`, etc.)
- Tailwind CSS with custom glass-morphism effects
- Responsive design (mobile, tablet, desktop)
- Color-coded risk levels:
  - **High**: Red (#ef4444)
  - **Medium**: Amber (#f59e0b)
  - **Low**: Green (#10b981)

## Future Enhancements

1. **Real-time Updates**: Implement WebSocket for live updates
2. **Risk Calendar**: Add interactive calendar showing high-risk dates
3. **Historical Charts**: Visualize shortage trends over time
4. **Batch Predictions**: Analyze multiple date scenarios
5. **Export Reports**: PDF/CSV export of shortage analysis
6. **Advanced Filters**: Filter by season, region, or severity
7. **Predictive Alerts**: Email/SMS alerts for high-risk predictions
