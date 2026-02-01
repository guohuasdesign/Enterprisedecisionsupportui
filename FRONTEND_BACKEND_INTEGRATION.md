# Frontend-Backend Integration Guide

## Overview

The frontend is now connected to the Node.js backend service (no n8n required). The backend handles all analysis logic including GeoJSON processing, distance calculations, and OpenAI integration.

## Architecture

```
Frontend (React + Vite)
    ↓ fetch POST /run-analysis
Backend (Node.js + Express)
    ↓ processes GeoJSON
    ↓ calculates distances
    ↓ calls OpenAI
    ↓ returns JSON
Frontend receives and displays results
```

## How It Works

### 1. Frontend Service (`src/services/analysisService.ts`)

The frontend service provides:
- `runAnalysis()` - Calls backend `/run-analysis` endpoint
- `checkBackendHealth()` - Checks if backend is available

### 2. Backend Endpoint (`backend/src/index.ts`)

The backend provides:
- `POST /run-analysis` - Main analysis endpoint
- `GET /health` - Health check endpoint

### 3. Frontend Integration

The "RUN SCENARIO ANALYSIS" button in the Situation Room:
1. Calls `runAnalysis()` from the frontend service
2. Shows loading state while processing
3. Receives analysis results from backend
4. Automatically navigates to Scenario Lab with results

## Configuration

### Backend URL

The frontend connects to backend via environment variable:

```env
# In frontend .env file (optional, defaults to localhost:3000)
VITE_BACKEND_URL=http://localhost:3000
```

### Backend Configuration

```env
# In backend/.env file
OPENAI_API_KEY=your-openai-api-key
PORT=3000
NODE_ENV=development
```

## Usage

### Starting Both Services

**Terminal 1 - Frontend:**
```bash
cd Enterprisedecisionsupportui
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd Enterprisedecisionsupportui/backend
npm run dev
```

### Using the Analysis Feature

1. Open the frontend at `http://localhost:5173`
2. Go to "Situation Room" (main page)
3. Click "RUN SCENARIO ANALYSIS" button
4. Wait for analysis to complete (shows "ANALYZING..." state)
5. Results automatically appear in Scenario Lab

## API Response Format

The backend returns:

```json
{
  "success": true,
  "trace_id": "uuid",
  "event": {
    "id": "EVT-WX-0001",
    "type": "event",
    "location": { "lat": 53.868, "lng": 8.7 }
  },
  "vessels_affected": [
    {
      "vessel_id": "...",
      "vessel_name": "...",
      "distance_nm": 45.2,
      "risk_level": "high",
      "cargo": "...",
      "value_eur": 15800000
    }
  ],
  "scenarios": [
    {
      "scenario_id": "SCN-001",
      "name": "Strategic Reroute...",
      "delay_hours": 168,
      "cost_impact_eur": 420000,
      "rationale": "...",
      "legal_risk": "Low",
      "confidence_score": 94
    }
  ],
  "warnings": [],
  "metadata": {
    "analysis_timestamp": "...",
    "total_vessels_analyzed": 7
  }
}
```

## Error Handling

- **Backend not available**: Shows warning message in UI
- **Analysis fails**: Shows error alert with details
- **Network errors**: Handled gracefully with user feedback

## Advantages Over n8n

✅ No external service dependency
✅ Full control over logic
✅ Better error handling
✅ Type-safe TypeScript integration
✅ Production-ready code structure
✅ Easier debugging and testing

## Troubleshooting

### Backend not connecting

1. Check backend is running: `lsof -i :3000`
2. Check backend health: `curl http://localhost:3000/health`
3. Verify `VITE_BACKEND_URL` in frontend `.env` (if set)

### Analysis fails

1. Check backend logs for errors
2. Verify OpenAI API key in backend `.env`
3. Check GeoJSON files exist in project root
4. Check browser console for network errors

### CORS errors

Backend already has CORS enabled. If issues persist, check:
- Backend is running on expected port
- Frontend is using correct backend URL
