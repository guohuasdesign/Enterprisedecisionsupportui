# Quick Start Guide - IDSS Backend

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Create `.env` file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your OpenAI API key:
```env
OPENAI_API_KEY=your-openai-api-key-here
PORT=3000
NODE_ENV=development
```

## Run the Service

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## Test the Service

### Health Check
```bash
curl http://localhost:3000/health
```

### Run Analysis
```bash
curl -X POST http://localhost:3000/run-analysis \
  -H "Content-Type: application/json" \
  -d '{}'
```

## N8N Integration

In your n8n workflow:

1. Add an **HTTP Request** node
2. Method: `POST`
3. URL: `http://localhost:3000/run-analysis` (or your server URL)
4. Body: `{}` (empty JSON object)
5. Response will contain the analysis result

## Expected Response Format

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
      "risk_level": "high"
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

## Troubleshooting

- **Port already in use**: Change `PORT` in `.env`
- **OpenAI errors**: Check API key and credits
- **GeoJSON not found**: Ensure `incident_data.geojson` and `shipping_data.geojson` are in parent directory
- **Module not found**: Run `npm install` again
