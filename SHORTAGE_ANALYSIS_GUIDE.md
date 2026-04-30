# Shortage Analysis Feature - Setup & API Integration Guide

This guide covers the Electricity Shortage Analysis feature, which visualizes electricity shortage predictions for Indian states using machine learning models and a FastAPI backend.

## 📋 Feature Overview

The shortage analysis page displays:
- **National risk rankings** - All states ranked by shortage risk probability
- **Summary statistics** - Historical and aggregated shortage data
- **High-risk alerts** - States requiring immediate attention
- **State-level details** - Detailed predictions and historical data for individual states
- **Interactive visualizations** - Charts and tables for data exploration

## 🚀 Backend Setup (FastAPI Server)

### Prerequisites
- Python 3.8+
- FastAPI
- Uvicorn
- pandas, numpy

### Installation

```bash
# Navigate to backend directory
cd electricity-demand-prediction-app/backend

# Install dependencies (if not already installed)
pip install fastapi uvicorn pandas numpy pydantic

# Or use the requirements.txt
pip install -r requirements.txt
```

### Running the API Server

**Option 1: Using PowerShell (Windows)**
```powershell
cd electricity-demand-prediction-app\backend
python -m uvicorn shortage_api:app --reload --host 127.0.0.1 --port 8001
```

**Option 2: Using Command Prompt**
```cmd
cd electricity-demand-prediction-app\backend
python -m uvicorn shortage_api:app --reload --host 127.0.0.1 --port 8001
```

**Option 3: Using Batch Script**
Run the provided `start.bat` file from the root directory.

### Verify API is Running
- **Health Check**: http://localhost:8001/health
- **API Docs**: http://localhost:8001/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8001/redoc (ReDoc)

## 🌐 Frontend Setup (Next.js)

### Prerequisites
- Node.js 16+
- npm or pnpm

### Installation

```bash
cd electricity-demand-prediction-app

# Install dependencies
npm install
# or
pnpm install
```

### Running the Development Server

```bash
npm run dev
# or
pnpm dev
```

The app will be available at: **http://localhost:3000**

Navigate to: **http://localhost:3000/shortage-analysis**

## 📡 API Service Integration

The frontend uses a centralized API service located at:
`lib/shortage-api-service.ts`

This service handles:
- All API endpoints
- Error handling and retry logic
- Type definitions for responses
- Request/response formatting

### Configuration

The API service uses the following environment variable:
```bash
NEXT_PUBLIC_SHORTAGE_API_URL=http://localhost:8001
```

If not set, it defaults to `http://localhost:8001`.

## 🔌 Available API Endpoints

### Health & Status
- `GET /health` - API health check and model status

### States
- `GET /states` - List all available states

### National Data
- `GET /national/risk` - National risk rankings for all states
- `GET /national/risk?limit=10` - Top risk states with limit
- `GET /national/risk?season=Summer` - Filter by season
- `GET /national/top_risk?limit=5` - Top 5 risk states
- `GET /national/summary` - National summary statistics
- `GET /severity_breakdown` - Shortage severity statistics

### State-Specific Data
- `GET /state/{state}` - Detailed state information
- `GET /state/{state}/history?days=90` - Historical shortage data
- `GET /state/{state}/risk_calendar?days=30` - Forecast calendar

## 📊 Component Structure

### Page Components
- **`app/shortage-analysis/page.tsx`** - Main shortage analysis page
  - Displays national overview
  - State rankings and risk cards
  - High-risk alerts table
  - State selector and detail view

### Visualization Components
- **`components/shortage-risk-chart.tsx`** - Bar/line charts for risk visualization
- **`components/state-shortage-detail.tsx`** - State-level detail card with statistics

### API & Data
- **`lib/shortage-api-service.ts`** - Centralized API service
- **`lib/types.ts`** - TypeScript interfaces and types

## 🔧 Common Issues & Troubleshooting

### Issue: "API not running on port 8001"
**Solution:**
1. Verify the server is running: `http://localhost:8001/health`
2. Check if port 8001 is in use: `netstat -ano | findstr :8001` (Windows)
3. Kill the process if needed and restart
4. Ensure no firewall is blocking port 8001

### Issue: CORS errors
**Solution:**
- The API has CORS enabled for all origins (`allow_origins=["*"]`)
- If still experiencing issues, check browser console for specific error

### Issue: "Failed to fetch" errors
**Solution:**
1. Ensure backend and frontend are running
2. Check network tab in browser DevTools
3. Verify API URL in environment variables
4. Check that backend is not behind a proxy

### Issue: Data not loading in components
**Solution:**
1. Check browser console for error messages
2. Verify API endpoints return data: `curl http://localhost:8001/national/risk`
3. Check that state name matches exactly (case-sensitive)

## 📈 Data Sources & ML Models

The shortage predictions are based on:
- **Historical Data**: 2023-2026 electricity grid data
- **Features**: 
  - Weather (temperature, humidity, rainfall)
  - Date/time (season, day of week, quarter)
  - Grid context (demand averages, shortage history)
- **Models**: Rule-based heuristic (can be replaced with trained ML model)

## 🔐 Environment Variables

### Required for Production
```bash
NEXT_PUBLIC_SHORTAGE_API_URL=http://your-api-domain:8001
```

### Optional
```bash
NODE_ENV=production  # or development
```

## 📝 Notes

- The API service automatically handles timeouts and network errors
- All API calls include error handling and user-friendly error messages
- The app gracefully degrades if API is unavailable
- Refresh buttons allow manual data updates

## 🎯 Next Steps

1. **Customize Predictions**: Replace the rule-based predictor in `shortage_api.py` with your trained ML model
2. **Database Integration**: Connect to a real database for historical data
3. **Real-time Updates**: Add WebSocket support for live predictions
4. **Notifications**: Implement alerts for high-risk states
5. **Export Features**: Add CSV/PDF export for reports

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Recharts Documentation](https://recharts.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated**: April 28, 2026
**Feature Status**: ✅ Complete and Functional
