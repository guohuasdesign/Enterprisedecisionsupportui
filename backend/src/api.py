from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, field_validator
import json
import pandas as pd
from simulation_engine import MonteCarloSimulator
from routing_engine import RoutingEngine

app = FastAPI(title="Intelligent Decision Support API")

# Initialize engines
simulator = MonteCarloSimulator(base_hourly_cost=1000)
router = RoutingEngine()

# Data Loading
vessels_data = []
avg_distance_km = 5000 # Default fallback
avg_cargo_value = 500000 # Default fallback

try:
    with open("Lena Case 31.01.26.json") as f:
        data = json.load(f)
        
    total_dist = 0
    total_val = 0
    count = 0
    
    for feature in data.get("features", []):
        props = feature.get("properties", {})
        # Lena Case file doesn't have "feature_kind", check for vessel attributes
        if "vessel_name" in props:
            vessels_data.append(feature)
            
            # Calculate stats
            dist_nm = props.get("dist_hamburg_nm", 0)
            val_eur = props.get("value_eur", 0)
            
            # Convert NM to KM
            dist_km = dist_nm * 1.852
            total_dist += dist_km
            
            # Convert EUR to USD (approx 1.08)
            val_usd = val_eur * 1.08
            total_val += val_usd
            
            count += 1
            
            # Add fields expected by the rest of the app (Contract ID etc)
            props["contract_id"] = f"LENA-{count}"
            props["route_name"] = f"Hamburg Route: {props.get('vessel_name')}"
            props["cargo_value_usd"] = val_usd
            # Heuristic for penalty based on value (e.g. 0.01% per hour)
            props["late_penalty_usd_per_hour"] = val_usd * 0.0001 
            props["client_importance"] = "High"

    if count > 0:
        avg_distance_km = total_dist / count
        avg_cargo_value = total_val / count
        print(f"Loaded {count} vessels. Avg Dist: {avg_distance_km:.2f}km, Avg Value: ${avg_cargo_value:.2f}")

except FileNotFoundError:
    print("Warning: Lena Case 31.01.26.json not found, using defaults.")


# Request Models
class DelayRequest(BaseModel):
    expected_delay_hours: float
    contract_penalty_per_hour: float = 0 # Optional override
    spoilage_rate_12h: float = 0.30 # Default 30% per 12h

    @field_validator('expected_delay_hours', 'contract_penalty_per_hour', 'spoilage_rate_12h')
    @classmethod
    def check_non_negative(cls, v):
        if v < 0:
            raise ValueError('Must be non-negative')
        return v

class BlockageRequest(BaseModel):
    expected_duration_half_days: float
    contract_penalty_per_hour: float = 0
    spoilage_rate_12h: float = 0.30
    
    @field_validator('expected_duration_half_days', 'contract_penalty_per_hour', 'spoilage_rate_12h')
    @classmethod
    def check_non_negative(cls, v):
        if v < 0:
            raise ValueError('Must be non-negative')
        return v

class AgentReportRequest(BaseModel):
    scenario_type: str # 'delay' or 'blockage'
    input_value: float # hours or half_days
    spoilage_rate_12h: float = 0.30

    @field_validator('input_value', 'spoilage_rate_12h')
    @classmethod
    def check_non_negative(cls, v):
        if v < 0:
            raise ValueError('Must be non-negative')
        return v

@app.get("/")
def read_root():
    return {"status": "active", "loaded_vessels": len(vessels_data), "average_distance_km": avg_distance_km}

@app.post("/simulate/delay")
def simulate_delay(request: DelayRequest):
    # 1. Run Simulation
    sim_results = simulator.run_delay_simulation(
        request.expected_delay_hours, 
        contract_penalty_per_hour=request.contract_penalty_per_hour,
        cargo_value=avg_cargo_value,
        spoilage_rate=request.spoilage_rate_12h
    )
    
    # 2. Get Quintiles
    delay_quitiles = simulator.get_quintiles(sim_results, "delay_hours")
    cost_quintiles = simulator.get_quintiles(sim_results, "total_cost")
    
    # 3. Alternatives
    alts = router.estimate_alternative_routes(
        avg_distance_km, 
        current_delay_hours=request.expected_delay_hours,
        cargo_value=avg_cargo_value,
        spoilage_rate=request.spoilage_rate_12h
    )
    
    # 4. New Provider
    # Use average from loaded contracts if available, else default
    new_order = router.estimate_new_order_cost(avg_cargo_value)

    return {
        "scenario": "delay",
        "input_hours": request.expected_delay_hours,
        "results": {
            "delay_quintiles_hours": delay_quitiles,
            "cost_quintiles_usd": cost_quintiles
        },
        "alternative_routes": alts,
        "new_order_option": new_order
    }

@app.post("/simulate/blockage")
def simulate_blockage(request: BlockageRequest):
    # 1. Run Simulation
    sim_results = simulator.run_blockage_simulation(
        request.expected_duration_half_days, 
        contract_penalty_per_hour=request.contract_penalty_per_hour,
        cargo_value=avg_cargo_value,
        spoilage_rate=request.spoilage_rate_12h
    )
    
    # 2. Get Quintiles
    duration_quintiles = simulator.get_quintiles(sim_results, "delay_days")
    cost_quintiles = simulator.get_quintiles(sim_results, "total_cost")
    
    # 3. Alternatives
    expected_delay_hours = request.expected_duration_half_days * 12
    alts = router.estimate_alternative_routes(
        avg_distance_km, 
        current_delay_hours=expected_delay_hours,
        cargo_value=avg_cargo_value,
        spoilage_rate=request.spoilage_rate_12h
    )
    
    # 4. New Provider
    new_order = router.estimate_new_order_cost(avg_cargo_value)

    return {
        "scenario": "blockage",
        "input_half_days": request.expected_duration_half_days,
        "results": {
            "duration_quintiles_days": duration_quintiles,
            "cost_quintiles_usd": cost_quintiles
        },
        "alternative_routes": alts,
        "new_order_option": new_order
    }

@app.post("/agent/report")
def get_agent_report(request: AgentReportRequest):
    """
    Returns a consolidated, uncertainty-aware report for an agent to process.
    """
    # 1. Determine parameters based on scenario
    delay_hours = 0
    if request.scenario_type == 'delay':
        delay_hours = request.input_value
    elif request.scenario_type == 'blockage':
        delay_hours = request.input_value * 12
    else:
        raise HTTPException(status_code=400, detail="Invalid scenario_type. Use 'delay' or 'blockage'.")
    
    # 2. Get Simulation Estimates (using 0 avg penalty for base simulation)
    # This gives us the variability of the delay itself
    sim_results = simulator.run_delay_simulation(
        delay_hours,
        cargo_value=avg_cargo_value,
        spoilage_rate=request.spoilage_rate_12h
    )
    
    # Helper to clean floats
    def get_stats(series):
        return {
            "expected": float(series.mean()),
            "optimistic": float(series.quantile(0.1)), # P10
            "pessimistic": float(series.quantile(0.9)) # P90
        }
    
    delay_stats = get_stats(sim_results["delay_hours"])
    cost_stats = get_stats(sim_results["total_cost"])
    
    # 3. Get Routing Alternatives (already has ranges)
    routes = router.estimate_alternative_routes(
        avg_distance_km, 
        current_delay_hours=delay_stats["expected"],
        cargo_value=avg_cargo_value,
        spoilage_rate=request.spoilage_rate_12h
    )
    
    # 4. Construct response
    report = {
        "meta": {
            "scenario": request.scenario_type,
            "input_value": request.input_value,
            "vessels_considered": len(vessels_data)
        },
        "simulation_forecast": {
            "delay_hours": delay_stats,
            "cost_impact_usd": cost_stats,
            "note": "Based on Monte Carlo simulation of weather/event impact."
        },
        "routing_options": {}
    }
    
    for r in routes:
        key = r["route_type"].replace(" ", "_").lower().replace("&_", "").replace("(", "").replace(")", "")
        report["routing_options"][key] = {
            "description": r["description"],
            "time_hours": r["time_hours"],
            "cost_usd": r["cost_usd"]
        }
        
    return report

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
