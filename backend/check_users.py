
import mysql.connector
import os

DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "127.0.0.1"),
    "port": int(os.environ.get("DB_PORT", "3306")),
    "user": os.environ.get("DB_USER", "root"),
    "password": os.environ.get("DB_PASSWORD", "MyNewPass123!"),
    "database": os.environ.get("DB_NAME", "healai")
}

def check_users():
    conn = mysql.connector.connect(**DB_CONFIG)
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, email, role, is_active FROM users")
    users = cur.fetchall()
    print("Users:")
    for u in users:
        print(u)
    conn.close()

if __name__ == "__main__":
    check_users()
