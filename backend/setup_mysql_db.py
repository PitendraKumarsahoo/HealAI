
import mysql.connector
from mysql.connector import errorcode
from werkzeug.security import generate_password_hash
import os

DB_SERVER_CONFIG = {
    'user': os.environ.get("DB_USER", "root"),
    'password': os.environ.get("DB_PASSWORD", "MyNewPass123!"),
    'host': os.environ.get("DB_HOST", "127.0.0.1"),
    'port': int(os.environ.get("DB_PORT", "3306")),
    'raise_on_warnings': False
}

DB_NAME = os.environ.get("DB_NAME", "healai")

def setup_mysql():
    try:
        conn = mysql.connector.connect(**DB_SERVER_CONFIG)
        cursor = conn.cursor()
        
        print(f"Creating database '{DB_NAME}'...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        cursor.execute(f"USE {DB_NAME}")
        
        print("Creating table 'users'...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('USER','MEDICAL','ADMIN') NOT NULL DEFAULT 'USER',
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """)

        print("Creating table 'predictions'...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            disease VARCHAR(50) NOT NULL,
            prediction INT NOT NULL,
            probability FLOAT NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """)
        
        # Seed Admin
        admin_email = 'admin@healai.com'
        cursor.execute("SELECT id FROM users WHERE email=%s", (admin_email,))
        if not cursor.fetchone():
            print("Seeding admin user...")
            pwd_hash = generate_password_hash('admin123')
            cursor.execute(
                "INSERT INTO users (name, email, password_hash, role, is_active) VALUES (%s, %s, %s, %s, %s)",
                ("System Admin", admin_email, pwd_hash, "ADMIN", 1)
            )
            conn.commit()
            print("Admin user seeded.")
        else:
            print("Admin user already exists.")

        conn.commit()
        print("MySQL Database setup completed successfully!")
        
    except mysql.connector.Error as err:
        print(f"Database setup failed: {err}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    setup_mysql()
