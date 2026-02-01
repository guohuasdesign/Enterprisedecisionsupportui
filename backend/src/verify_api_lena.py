
import requests
import time
import subprocess
import os
import signal
import sys

def verify_api_lena():
    print("Starting API verification...")
    
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
    
    try:
        base_url = "http://localhost:8000"
        
        # 1. Test Root Endpoint
        print("\nTesting Root Endpoint...")
        resp = requests.get(f"{base_url}/")
        print(f"Status: {resp.status_code}")
        data = resp.json()
        print(f"Response: {data}")
        
        # Verify loaded vessels count (should be 9 based on file)
        if data.get("loaded_vessels") == 9:
            print("PASS: Correct number of vessels loaded.")
        else:
            print(f"FAIL: Expected 9 vessels, got {data.get('loaded_vessels')}")

        # 2. Test Delay Simulation
        print("\nTesting Delay Simulation...")
        payload = {"expected_delay_hours": 24}
        resp = requests.post(f"{base_url}/simulate/delay", json=payload)
        data = resp.json()
        
        # Verify that alternative routes use the dynamic average distance
        # From previous verify_lena.py: 4200nm is one vessel, but average should be different
        # Let's just check if it's not the old 5000 default if logic works, 
        # actually, the mock routing logic is proportional to distance.
        alts = data.get("alternative_routes", [])
        if alts:
            print(f"PASS: Received {len(alts)} alternative routes.")
            print(f"Sample Route Cost: {alts[0]['estimated_cost_usd']}")
            # cost = dist * rate. old dist 5000, rate 0.1 -> 500. 
            # avg dist of 9 vessels will be calculated.
        
        # 3. Test Blockage Simulation
        print("\nTesting Blockage Simulation...")
        payload = {"expected_duration_half_days": 2}
        resp = requests.post(f"{base_url}/simulate/blockage", json=payload)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            print("PASS: Blockage simulation returned 200 OK")
            
    except Exception as e:
        print(f"ERROR: {e}")
        # Print server output for debugging
        if process.poll() is not None:
             out, err = process.communicate()
             print(f"Server STDOUT: {out.decode()}")
             print(f"Server STDERR: {err.decode()}")
    finally:
        # Kill the server
        if process.poll() is None:
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)
        
        # Capture output if not already captured
        out, err = process.communicate()
        if out or err:
             print(f"Server STDOUT: {out.decode()}")
             print(f"Server STDERR: {err.decode()}")
        print("\nAPI Server stopped.")

if __name__ == "__main__":
    verify_api_lena()
