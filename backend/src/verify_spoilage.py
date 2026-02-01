
import pandas as pd
import numpy as np
from simulation_engine import MonteCarloSimulator
from routing_engine import RoutingEngine

def verify_spoilage():
    print("Verifying Spoilage Logic...")
    
    # 1. Test Simulation Engine Calculations
    print("\n1. Testing Simulation Engine formula...")
    sim = MonteCarloSimulator()
    
    # Test Case: Value 100, Rate 0.3, Delay 12 hours (1 half-day)
    # Expected Remaining: 100 * (1 - 0.3)^1 = 70
    # Expected Spoilage Cost: 30
    results = sim.run_delay_simulation(
        expected_delay_hours=12, 
        n_simulations=5000, # High N to get mean close to expected
        contract_penalty_per_hour=0,
        cargo_value=100.0,
        spoilage_rate=0.3
    )
    
    mean_delay = results["delay_hours"].mean()
    mean_spoilage = results["spoilage_cost"].mean()
    print(f"Mean Delay: {mean_delay:.2f} hours")
    print(f"Mean Spoilage Cost: {mean_spoilage:.2f}")
    
    # Analytical check:
    # If delay was exactly 12 hours:
    exact_spoilage = 100 * (1 - (1 - 0.3)**(12/12))
    print(f"Analytical Spoilage for exactly 12h: {exact_spoilage:.2f}")
    
    if 25 < mean_spoilage < 35:
        print("PASS: Mean spoilage is within reasonable range of 30 (+/- variance).")
    else:
        print("FAIL: Spoilage seems off.")

    # 2. Test Routing Engine Calculations
    print("\n2. Testing Routing Engine formula...")
    router = RoutingEngine()
    
    # Mock: Distance 300km (10 hours at 30km/h sea speed)
    # Delay: 14 hours
    # Total Time: 24 hours.
    # Excess Time: 14 hours (since sea time is baseline)
    # Half Days: 14/12 = 1.166
    dist_km = 300
    delay_hours = 14
    val = 1000
    rate = 0.3
    
    routes = router.estimate_alternative_routes(
        distance_km=dist_km, 
        current_delay_hours=delay_hours,
        cargo_value=val,
        spoilage_rate=rate
    )
    
    for r in routes:
        if r["route_type"] == "Wait & Sea":
            exp_cost = r["cost_usd"]["expected"]
            print(f"Wait & Sea Cost (Expected): {exp_cost:.2f}")
            
            # Manual Check
            # Sea Speed 30 km/h -> 10 hours travel
            # Total Time = 10 + 14 = 24h
            # Excess = 14h
            # Excess Half Days = 1.166...
            # Rem = 1000 * (0.7 ^ 1.166)
            rem_ratio = pow(0.7, 14/12)
            spoilage = val * (1 - rem_ratio)
            base_cost = 300 * 0.1 # 30
            expected_total = base_cost + spoilage
            
            print(f"Manual Check: Base {base_cost:.2f} + Spoilage {spoilage:.2f} = {expected_total:.2f}")
            
            if abs(exp_cost - expected_total) < 5:
                print("PASS: Routing cost matches manual calculation.")
            else:
                print(f"FAIL: Mismatch. API: {exp_cost}, Manual: {expected_total}")

if __name__ == "__main__":
    verify_spoilage()
