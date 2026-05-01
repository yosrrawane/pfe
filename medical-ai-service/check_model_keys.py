import torch
from inspect_model import MODEL_PATH

checkpoint = torch.load(MODEL_PATH, map_location='cpu')
state_dict = checkpoint['model_state_dict'] if 'model_state_dict' in checkpoint else checkpoint

keys = list(state_dict.keys())
print("First 20 keys:", keys[:20])
print("Last 10 keys:", keys[-10:])
