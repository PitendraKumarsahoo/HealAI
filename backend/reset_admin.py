
import mysql.connector
import os
from werkzeug.security import generate_password_hash

DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "127.0.0.1"),
    "port": int(os.environ.get("DB_PORT", "3306")),
    "user": os.environ.get("DB_USER", "root"),
    "password": os.environ.get("DB_PASSWORD", "MyNewPass123!"),
    "database": os.environ.get("DB_NAME", "healai")
}

def reset_admin():
    conn = mysql.connector.connect(**DB_CONFIG)
    try:
        cur = conn.cursor()
        email = "admin@healai.com"
        password = "AdminPass123!"
        hashed_pw = generate_password_hash(password)
        
        # Check if exists
        cur.execute("SELECT id FROM users WHERE email=%s", (email,))
        if cur.fetchone():
            print(f"Updating password for {email}...")
            cur.execute("UPDATE users SET password_hash=%s WHERE email=%s", (hashed_pw, email))
        else:
            print(f"Creating user {email}...")
            cur.execute(
                "INSERT INTO users (name, email, password_hash, role, is_active, created_at) VALUES (%s, %s, %s, %s, %s, NOW())",
                ("System Admin", email, hashed_pw, "ADMIN", 1)
            )
        
        conn.commit()
        print("Admin password reset successfully.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    reset_admin()
