import requests
import os

url = "http://localhost:8000/api/analyze"
# Create a dummy image for testing if no image exists
from PIL import Image
import io

test_image = Image.new('RGB', (224, 224), color = 'gray')
byte_io = io.BytesIO()
test_image.save(byte_io, 'PNG')
byte_io.seek(0)

files = {'file': ('test.png', byte_io, 'image/png')}
data = {'technicienId': 'test-checker'}

try:
    print(f"📡 Appel de l'API à {url}...")
    response = requests.post(url, files=files, data=data)
    if response.status_code == 200:
        res = response.json()
        print("✅ API FUNCTIONAL!")
        print(f"📋 Rapport généré : \n{res['rapport'][:200]}...")
        print("🔍 Pathologies détectées (Real Inférence) :")
        for p in res['pathologies']:
            print(f"  - {p['nom']}: {p['probabilite']}%")
    else:
        print(f"❌ Erreur API: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"❌ Impossible de contacter l'API : {e}")
