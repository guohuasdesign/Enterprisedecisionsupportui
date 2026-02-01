# IDSS Backend Service

Intelligent Decision Support System - Backend Analysis Service

## Overview

This Node.js service provides decision support analysis for supply chain disruptions. It processes GeoJSON data, calculates vessel exposure, and generates structured decision scenarios using OpenAI.

## Features

- ✅ Loads and processes GeoJSON files (incident_data.geojson, shipping_data.geojson)
- ✅ Extracts event features from GeoJSON
- ✅ Calculates distances using Haversine formula (nautical miles)
- ✅ Classifies vessel risk levels (high/medium/low)
- ✅ Generates deterministic scenario seeds
- ✅ Calls OpenAI API for structured scenario generation
- ✅ Returns JSON response with trace_id, event, vessels, scenarios, and warnings

## Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```env
OPENAI_API_KEY=your-openai-api-key-here
PORT=3000
NODE_ENV=development
```

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start
```

## API Endpoints

### POST `/run-analysis`

Main analysis endpoint (called by n8n webhook).

**Request Body (optional):**
```json
{
  "dataDir": "../"
}
```

**Response:**
```json
{
  "success": true,
  "trace_id": "uuid",
  "event": {
    "id": "EVT-WX-0001",
    "type": "event",
    "location": { "lat": 53.868, "lng": 8.7 },
    "properties": {...}
  },
  "vessels_affected": [
    {
      "vessel_id": "vessel-001",
      "vessel_name": "Arabian Pearl",
      "distance_nm": 45.2,
      "risk_level": "high",
      "cargo": "Petrochemicals",
      "value_eur": 15800000
    }
  ],
  "scenarios": [
    {
      "scenario_id": "SCN-001",
      "name": "Strategic Reroute (Cape of Good Hope)",
      "delay_hours": 168,
      "cost_impact_eur": 420000,
      "description": "...",
      "rationale": "...",
      "legal_risk": "Low",
      "confidence_score": 94,
      "assumptions": [...]
    }
  ],
  "warnings": [],
  "metadata": {
    "analysis_timestamp": "2025-01-XX...",
    "total_vessels_analyzed": 7,
    "high_risk_count": 2,
    "medium_risk_count": 3,
    "low_risk_count": 2
  },
  "performance": {
    "duration_ms": 1234
  }
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "IDSS Backend",
  "timestamp": "2025-01-XX..."
}
```

## N8N Integration

Configure n8n webhook to call:
```
POST http://localhost:3000/run-analysis
```

Or use the webhook path configured in n8n:
```
POST http://your-backend-url/run-analysis
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Main server entry point
│   ├── types.ts                 # TypeScript type definitions
│   ├── services/
│   │   ├── analysisService.ts   # Main analysis orchestration
│   │   └── openaiService.ts     # OpenAI API integration
│   └── utils/
│       ├── dataLoader.ts        # GeoJSON file loading
│       ├── distance.ts          # Haversine distance calculation
│       └── scenarioSeeds.ts     # Deterministic scenario generation
├── dist/                        # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── .env                         # Environment variables (not in git)
```

## Key Functions

### Distance Calculation
- Uses Haversine formula for accurate geographic distance
- Returns distance in nautical miles
- Risk classification: <=120nm (high), <=250nm (medium), >250nm (low)

### Scenario Generation
1. **Deterministic Seeds**: 5 base scenarios with delay/cost estimates
2. **OpenAI Enhancement**: Structured analysis with rationale, legal risk, confidence scores
3. **Fallback**: If OpenAI fails, returns seed data with default values

### Error Handling
- Comprehensive error handling with trace IDs
- Warnings array for non-fatal issues
- Graceful degradation if OpenAI is unavailable

## Production Considerations

- ✅ Environment variable validation
- ✅ Error handling and logging
- ✅ Type safety with TypeScript
- ✅ Modular, testable code structure
- ✅ No autonomous decisions (human-in-the-loop)
- ✅ Explainable structured output

## Testing

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test analysis endpoint
curl -X POST http://localhost:3000/run-analysis \
  -H "Content-Type: application/json" \
  -d '{}'
```

## License

MIT
