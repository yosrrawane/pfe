import torch
import os

MODEL_PATH = r"C:\Users\Yosr\Downloads\chexpert_model_final.pth"

if os.path.exists(MODEL_PATH):
    checkpoint = torch.load(MODEL_PATH, map_location='cpu')
    print("KEYS:", checkpoint.keys() if isinstance(checkpoint, dict) else "Not a dict")
    
    if isinstance(checkpoint, dict):
        if 'config' in checkpoint:
            print("CONFIG:", checkpoint['config'])
        if 'labels' in checkpoint:
            print("LABELS:", checkpoint['labels'])
        
        # Print first 20 keys of state_dict
        sd = checkpoint.get('model_state_dict', checkpoint)
        print("STATE_DICT KEYS (first 20):")
        for k in list(sd.keys())[:20]:
            print(f"  {k}")
else:
    print("File not found")
