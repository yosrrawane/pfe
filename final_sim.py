import requests
import io
import os
from PIL import Image

def run():
    print("--- 🔬 [STEP 1] Direct AI Service Ping ---")
    try:
        health = requests.get("http://127.0.0.1:8000/health", timeout=5)
        print(f"FastAPI Status: {health.json()}")
    except Exception as e:
        print(f"❌ FastAPI down: {e}")
        return

    print("\n--- ☕ [STEP 2] E2E Java Analysis Simulation ---")
    java_url = "http://127.0.0.1:8081/api/analyses/upload"
    
    # Create test image
    img = Image.new('RGB', (100, 100), color = 'blue')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_bytes = img_byte_arr.getvalue()

    try:
        files = {'file': ('test_sim.png', img_bytes, 'image/png')}
        params = {'uploaderId': 'SIMULATOR_BOT', 'mock': 'false'}
        
        print("Sending analysis request to Java (8081)...")
        resp = requests.post(java_url, files=files, params=params, timeout=30)
        
        print(f"Java Response Code: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print("✅ SUCCESS! Result received from AI via Java.")
            print(f"Analysis ID: {data.get('id')}")
            print(f"Global Score: {data.get('scoreConfianceGlobal')}%")
            print(f"Pathologies: {len(data.get('pathologies', []))} detected.")
        else:
            print(f"❌ Failure: {resp.text}")
    except Exception as e:
        print(f"❌ End-to-End simulation failed: {e}")

if __name__ == "__main__":
    run()
