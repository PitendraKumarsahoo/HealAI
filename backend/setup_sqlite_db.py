
import sqlite3
from werkzeug.security import generate_password_hash
import os

DB_NAME = "healai.db"

def setup_sqlite():
    if os.path.exists(DB_NAME):
        print(f"Removing existing {DB_NAME}...")
        os.remove(DB_NAME)

    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        print("Creating table 'users'...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'USER',
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)

        print("Creating table 'predictions'...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            disease TEXT NOT NULL,
            prediction INTEGER NOT NULL,
            probability REAL NOT NULL,
            patient_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """)
        
        # Seed Admin
        admin_email = 'admin@healai.com'
        cursor.execute("SELECT id FROM users WHERE email=?", (admin_email,))
        if not cursor.fetchone():
            print("Seeding admin user...")
            pwd_hash = generate_password_hash('admin123')
            cursor.execute(
                "INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)",
                ("System Admin", admin_email, pwd_hash, "ADMIN", 1)
            )
            conn.commit()
            print("Admin user seeded.")
        else:
            print("Admin user already exists.")

        conn.commit()
        print("SQLite Database setup completed successfully!")
        
    except sqlite3.Error as err:
        print(f"Database setup failed: {err}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    setup_sqlite()
