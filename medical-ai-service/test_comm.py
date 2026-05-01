import requests
import os

def test_java_simulation():
    url = "http://127.0.0.1:8000/api/analyze"
    # Use the test image created earlier
    file_path = "test_input.png"
    
    if not os.path.exists(file_path):
        print("Missing test_input.png")
        return

    print(f"Simulating Java request to {url}...")
    with open(file_path, "rb") as f:
        files = {"file": ("test.png", f, "image/png")}
        data = {"technicienId": "JAVA_SIMULATOR"}
        
        try:
            response = requests.post(url, data=data, files=files, timeout=30)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                json_res = response.json()
                print("SUCCESS: Received JSON from FastAPI")
                print(f"Pathologies found: {len(json_res.get('pathologies', []))}")
                print(f"Heatmap present: {'heatmapBase64' in json_res}")
            else:
                print(f"FAILED: {response.text}")
        except Exception as e:
            print(f"ERROR: {e}")

if __name__ == "__main__":
    test_java_simulation()
