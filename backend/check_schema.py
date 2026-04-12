import mysql.connector
import os

DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "127.0.0.1"),
    "port": int(os.environ.get("DB_PORT", "3306")),
    "user": os.environ.get("DB_USER", "root"),
    "password": os.environ.get("DB_PASSWORD", "MyNewPass123!"),
    "database": os.environ.get("DB_NAME", "healai")
}

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute("DESCRIBE predictions")
    rows = cur.fetchall()
    print("Table: predictions")
    for row in rows:
        print(row)
    conn.close()
except Exception as e:
    print(e)
