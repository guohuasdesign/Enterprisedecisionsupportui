
import requests
import time
import subprocess
import os
import signal
import sys

def verify_agent_api():
    print("Starting Agent API verification...")
    
    # Start the API server in the background using the venv
    venv_python = os.path.abspath("venv/bin/python")
    process = subprocess.Popen(
        [venv_python, "-m", "uvicorn", "api:app", "--port", "8000"], 
        stdout=subprocess.PIPE, 
        stderr=subprocess.PIPE,
        preexec_fn=os.setsid
    )
    
    # Wait for server to start
    print("Waiting for API server to start...")
    time.sleep(5)
    
    base_url = "http://localhost:8000/agent/report"
    
    try:
        # 1. Test Valid Agent Report
        print("\n1. Testing Valid Agent Report (Delay: 24h)...")
        payload = {"scenario_type": "delay", "input_value": 24.0}
        resp = requests.post(base_url, json=payload)
        
        if resp.status_code == 200:
            data = resp.json()
            print("PASS: Request successful.")
            
            # Check structure
            sim_forecast = data.get("simulation_forecast", {})
            cost_impact = sim_forecast.get("cost_impact_usd", {})
            
            if "optimistic" in cost_impact and "pessimistic" in cost_impact:
                print(f"PASS: Simulation forecast has uncertainty ranges. Expected Cost: {cost_impact['expected']:.2f}")
            else:
                print("FAIL: Missing uncertainty in simulation forecast.")
                
            routing = data.get("routing_options", {})
            truck = routing.get("land_truck", {})
            truck_cost = truck.get("cost_usd", {})
            
            if "optimistic" in truck_cost and "pessimistic" in truck_cost:
                 print(f"PASS: Routing options have uncertainty ranges. Truck Opt Cost: {truck_cost['optimistic']:.2f}")
            else:
                 print("FAIL: Missing uncertainty in routing options.")
        else:
            print(f"FAIL: Status code {resp.status_code}")
            print(resp.text)

        # 2. Test Safeguard: Negative Input
        print("\n2. Testing Non-Negativity Safeguard (Negative Hours)...")
        bad_payload = {"scenario_type": "delay", "input_value": -5.0}
        resp = requests.post(base_url, json=bad_payload)
        
        if resp.status_code == 422:
            print("PASS: Server rejected negative input with 422 Unprocessable Entity.")
        else:
            print(f"FAIL: Expected 422, got {resp.status_code}")

    except Exception as e:
        print(f"ERROR: {e}")
    finally:
        # Kill the server
        if process.poll() is None:
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)
        
        # Capture output
        out, err = process.communicate()
        if err:
             # Just print error if meaningful failure happened, or if we want to see logs
             # print(f"Server STDERR: {err.decode()}")
             pass
        print("\nAPI Server stopped.")

if __name__ == "__main__":
    verify_agent_api()
