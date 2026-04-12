
import requests
import json
import os
import sys

BASE_URL = "http://127.0.0.1:5000"

def get_token():
    # 1. Register/Login to get token
    random_id = os.urandom(4).hex()
    email = f"test_{random_id}@example.com"
    password = "TestPassword123!"
    
    try:
        res = requests.post(f"{BASE_URL}/auth/register", json={
            "name": "Test User",
            "email": email,
            "password": password
        })
        if res.status_code == 200:
            return res.json().get("token")
        
        # Login if register fails
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
        if res.status_code == 200:
            return res.json().get("token")
            
    except Exception as e:
        print(f"Auth failed: {e}")
    return None

def test_all():
    token = get_token()
    if not token:
        print("Failed to get token")
        return

    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Diabetes (8 features)
    print("\n--- Testing Diabetes ---")
    data_diabetes = [0, 120, 70, 20, 80, 25.0, 0.5, 30]
    res = requests.post(f"{BASE_URL}/predict/diabetes", json={"features": data_diabetes}, headers=headers)
    print(f"Status: {res.status_code}, Response: {res.text}")

    # 2. Heart (13 features)
    print("\n--- Testing Heart ---")
    # age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
    data_heart = [60, 1, 0, 140, 260, 0, 0, 140, 0, 1.5, 2, 0, 2]
    res = requests.post(f"{BASE_URL}/predict/heart", json={"features": data_heart}, headers=headers)
    print(f"Status: {res.status_code}, Response: {res.text}")

    # 3. Kidney (24 or 25 features?)
    print("\n--- Testing Kidney ---")
    # id, age, bp, sg, al, su, rbc, pc, pcc, ba, bgr, bu, sc, sod, pot, hemo, pcv, wc, rc, htn, dm, cad, appet, pe, ane
    # Total 25 fields in constants.tsx. Let's try sending 25 first.
    data_kidney_25 = [0, 60, 80, 1.020, 0, 0, 1, 1, 0, 0, 120, 40, 1.0, 140, 4.5, 14.0, 40, 8000, 5.0, 0, 0, 0, 0, 0, 0]
    res = requests.post(f"{BASE_URL}/predict/kidney", json={"features": data_kidney_25}, headers=headers)
    print(f"Status (25 features): {res.status_code}, Response: {res.text}")
    
    if res.status_code != 200:
        print("Retrying Kidney with 24 features (skipping ID)...")
        data_kidney_24 = data_kidney_25[1:]
        res = requests.post(f"{BASE_URL}/predict/kidney", json={"features": data_kidney_24}, headers=headers)
        print(f"Status (24 features): {res.status_code}, Response: {res.text}")

    # 4. Liver (10 features)
    print("\n--- Testing Liver ---")
    # age, gender, total_bilirubin, direct_bilirubin, alkaline_phosphotase, alamine_aminotransferase, aspartate_aminotransferase, total_protiens, albumin, ag_ratio
    data_liver = [60, 1, 0.7, 0.2, 180, 30, 40, 6.8, 3.2, 1.0]
    res = requests.post(f"{BASE_URL}/predict/liver", json={"features": data_liver}, headers=headers)
    print(f"Status: {res.status_code}, Response: {res.text}")

if __name__ == "__main__":
    test_all()
