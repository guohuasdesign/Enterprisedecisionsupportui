# Shipping Decision Support System

An intelligent API for analyzing shipping risks, forecasting delays, and estimating costs with value spoilage models. Designed for integration with AI Agents and decision support dashboards.

## Features

- **Stochastic Simulation**: Uses Monte Carlo methods (Poisson distribution) to forecast delay durations and impacts.
- **Routing Engine**: Estimates time and cost for multiple routing options (Wait & Sea, Land/Truck, Land/Train).
- **Spoilage Model**: Calculates cargo value depreciation using an exponential decay model (default 30% loss per 12h) to prioritize time-sensitive shipments.
- **Agent-Ready API**: Provides structured, uncertainty-aware reports (Expected, Optimistic, Pessimistic) via the `/agent/report` endpoint.
- **Real-World Data**: Ingests vessel data (e.g., "Lena Case") to calibrate fleet averages for simulations.

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the API**
   ```bash
   uvicorn api:app --reload
   ```

## Usage

### Agent Report
Get a consolidated decision report with uncertainty ranges.

**POST** `/agent/report`
```json
{
  "scenario_type": "delay",
  "input_value": 24,
  "spoilage_rate_12h": 0.30
}
```

**Response Snippet**:
```json
{
  "simulation_forecast": {
    "delay_hours": { "expected": 24.0, "optimistic": 20.0, "pessimistic": 29.0 },
    "cost_impact_usd": { "expected": 25000.0, ... }
  },
  "routing_options": {
    "wait_and_sea": { ... },
    "land_truck": { ... }
  }
}
```

### Direct Simulations
- **Delay**: `POST /simulate/delay`
- **Blockage**: `POST /simulate/blockage`

## Project Structure

- `api.py`: FastAPI application and endpoints.
- `simulation_engine.py`: Monte Carlo logic for delays and spoilage.
- `routing_engine.py`: Logic for estimating alternative routes and costs.
- `Lena Case 31.01.26.json`: Vessel fleet data used for calibration.

## Testing
Run the verification script to ensure all models are working:
```bash
python3 verify_agent_api.py
```
