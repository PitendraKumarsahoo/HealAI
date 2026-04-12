
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

def update_db():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # 1. Add patient_name column
        try:
            print("Adding patient_name column...")
            cur.execute("ALTER TABLE predictions ADD COLUMN patient_name VARCHAR(100) DEFAULT NULL")
            print("Column added.")
        except mysql.connector.Error as err:
            if err.errno == 1060: # Duplicate column name
                print("Column patient_name already exists.")
            else:
                print(f"Error adding column: {err}")

        # 2. Add Admin User
        print("Checking for admin user...")
        cur.execute("SELECT id FROM users WHERE email = 'admin@healai.com'")
        admin = cur.fetchone()
        if not admin:
            print("Creating admin user...")
            pwd_hash = generate_password_hash("AdminPass123!")
            cur.execute(
                "INSERT INTO users (name, email, password_hash, role, is_active, created_at) VALUES (%s, %s, %s, %s, %s, NOW())",
                ("System Admin", "admin@healai.com", pwd_hash, "ADMIN", 1)
            )
            print("Admin user created.")
        else:
            print("Admin user already exists.")

        conn.commit()
        conn.close()
        print("Database update complete.")

    except Exception as e:
        print(f"Database Error: {e}")

if __name__ == "__main__":
    update_db()
