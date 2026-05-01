import torch
import torch.nn as nn
from torchvision import models
import os
import sys

MODEL_PATH = os.path.join("models", "best_chexpert_model.pth")
NUM_CLASSES = 7

def test_loading():
    print(f"Checking for model file at {MODEL_PATH}...")
    if not os.path.exists(MODEL_PATH):
        print("ERROR: Model file not found!")
        return
    
    print("Loading architecture...")
    model = models.densenet121(weights=None)
    num_features = model.classifier.in_features
    model.classifier = nn.Linear(num_features, NUM_CLASSES)
    
    print("Loading weights...")
    try:
        state_dict = torch.load(MODEL_PATH, map_location="cpu")
        model.load_state_dict(state_dict)
        print("SUCCESS: Model loaded correctly!")
    except Exception as e:
        print(f"FAILED: Error loading state_dict: {e}")
        return

    print("Running dummy inference...")
    try:
        dummy_input = torch.randn(1, 3, 224, 224)
        model.eval()
        with torch.no_grad():
            output = model(dummy_input)
        print(f"SUCCESS: Inference completed. Output shape: {output.shape}")
    except Exception as e:
        print(f"FAILED: Error during inference: {e}")

    print("Testing Grad-CAM generation (performance intensive)...")
    try:
        from PIL import Image
        import io
        import time
        
        # Fake image
        img = Image.new('RGB', (224, 224), color = 'red')
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        image_bytes = img_byte_arr.getvalue()

        start_time = time.time()
        # We need to simulate the function from main.py or just call it if we import it
        # Let's just check if we can import main and call it
        import main
        heatmap_base64 = main.generate_gradcam_base64(image_bytes)
        duration = time.time() - start_time
        
        print(f"SUCCESS: Grad-CAM generated in {duration:.2f}s")
        print(f"Base64 length: {len(heatmap_base64)}")
    except Exception as e:
        print(f"FAILED: Grad-CAM error: {e}")

if __name__ == "__main__":
    test_loading()
