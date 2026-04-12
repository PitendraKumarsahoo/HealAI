
import requests
import sys

BASE_URL = "http://127.0.0.1:5000"

def test_auth_flow():
    print("1. Testing Registration...")
    reg_payload = {
        "name": "New User",
        "email": "newuser@example.com",
        "password": "password123"
    }
    try:
        resp = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
        print(f"Register Status: {resp.status_code}")
        print(f"Register Response: {resp.text}")
        
        if resp.status_code == 200 or "already registered" in resp.text:
            print("Registration check passed.")
        else:
            print("Registration failed.")
            return False
            
    except Exception as e:
        print(f"Registration Exception: {e}")
        return False

    print("\n2. Testing Login...")
    login_payload = {
        "email": "newuser@example.com",
        "password": "password123"
    }
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
        print(f"Login Status: {resp.status_code}")
        print(f"Login Response: {resp.text}")
        
        if resp.status_code == 200:
            print("Login success.")
            return True
        else:
            print("Login failed.")
            return False
    except Exception as e:
        print(f"Login Exception: {e}")
        return False

if __name__ == "__main__":
    if test_auth_flow():
        print("\nBackend Auth is working correctly.")
    else:
        print("\nBackend Auth has issues.")
        sys.exit(1)
