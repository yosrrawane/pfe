import requests
import json
import time

def run_full_simulation():
    # 1. Test AI Service (Direct)
    print("--- 🔬 STEP 1: TEST AI SERVICE (8000) ---")
    ai_url = "http://127.0.0.1:8000/api/analyze"
    try:
        with open("sim_test.png", "rb") as f:
            files = {"file": ("sim_test.png", f, "image/png")}
            data = {"technicienId": "SIM_USER_001"}
            resp = requests.post(ai_url, files=files, data=data, timeout=15)
            print(f"Status: {resp.status_code}")
            if resp.status_code == 200:
                print("✅ AI Service responded perfectly!")
                print(f"Top 1 Patho: {resp.json()['pathologies'][0]['nom']}")
            else:
                print(f"❌ AI Service Error: {resp.text}")
    except Exception as e:
        print(f"❌ AI Service Connection Failed: {e}")

    # 2. Test Java API (E2E)
    print("\n--- ☕ STEP 2: TEST JAVA API (8081) ---")
    java_url = "http://127.0.0.1:8081/api/analyses/upload"
    try:
        with open("sim_test.png", "rb") as f:
            files = {"file": ("sim_test.png", f, "image/png")}
            params = {"uploaderId": "SIM_USER_001", "mock": "false"}
            resp = requests.post(java_url, files=files, params=params, timeout=25)
            print(f"Status: {resp.status_code}")
            if resp.status_code == 200:
                print("✅ End-to-End Success! Java saved the AI results.")
                print(f"Generated Analysis ID: {resp.json()['id']}")
            else:
                print(f"❌ Java API Error: {resp.text}")
    except Exception as e:
        print(f"❌ Java API Connection Failed: {e}")

if __name__ == "__main__":
    run_full_simulation()
