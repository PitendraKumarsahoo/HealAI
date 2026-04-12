
import pickle
import numpy as np
import os

def check_classes():
    for disease in ['diabetes', 'heart', 'kidney', 'liver']:
        print(f"\nChecking {disease}...")
        try:
            model = pickle.load(open(f"models/{disease}.pkl" if disease != "diabetes" and disease != "heart" else f"models/{'diabete' if disease == 'diabetes' else 'heartl'}.pkl", "rb"))
            if hasattr(model, "classes_"):
                print(f"Classes: {model.classes_}")
            else:
                print("Model does not have classes_ attribute")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    check_classes()
