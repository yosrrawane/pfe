import urllib.request
import json

url = "http://localhost:8081/api/analyses"
try:
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        if not data:
            print("No analyses found.")
        else:
            for i, a in enumerate(data[:3]):
                face = a.get('imageFaceUrl')
                print(f"[{i}] ID: {a['id']}, FaceURL Length: {len(face) if face else 'NULL'}, Pathologies: {len(a.get('pathologies', []))}")
except Exception as e:
    print("Error:", e)
