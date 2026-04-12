
import requests
import json
import os
import sys

BASE_URL = "http://127.0.0.1:5000"

def test_prediction():
    print("1. Registering a new test user...")
    # Use a random email to avoid collision
    random_id = os.urandom(4).hex()
    email = f"test_{random_id}@example.com"
    password = "TestPassword123!"
    
    reg_payload = {
        "name": "Test User",
        "email": email,
        "password": password
    }
    
    try:
        # Try Register
        res = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
        token = None
        
        if res.status_code == 200:
            print(f"Registration successful for {email}")
            token = res.json().get("token")
        else:
            print(f"Registration failed: {res.text}")
            # If registration fails (e.g. exists), try login
            print("Attempting login...")
            res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
            if res.status_code == 200:
                print("Login successful")
                token = res.json().get("token")
            else:
                print(f"Login failed: {res.text}")
                
                # Fallback to admin login
                print("Attempting Admin login (admin@healai.com / admin123)...")
                res = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@healai.com", "password": "admin123"})
                if res.status_code == 200:
                    print("Admin Login successful")
                    token = res.json().get("token")
                else:
                    print(f"Admin Login failed: {res.text}")
                    return

        if not token:
            print("Could not get a valid token.")
            return

        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Test Diabetes Prediction
        print("\n2. Testing Diabetes Prediction...")
        # Diabetes: [pregnancies, glucose, bloodPressure, skinThickness, insulin, bmi, dpf, age]
        features = [0, 120, 70, 20, 80, 25.0, 0.5, 30] 
        
        payload = {"features": features}
        
        pred_res = requests.post(f"{BASE_URL}/predict/diabetes", json=payload, headers=headers)
        
        if pred_res.status_code == 200:
            print("Prediction Response:", pred_res.json())
            print("SUCCESS: Prediction endpoint is working.")
        else:
            print("Prediction Failed:", pred_res.status_code, pred_res.text)

    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_prediction()
