
import mysql.connector
import os

DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "MyNewPass123!",
    "database": "healai"
}

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute("SHOW TABLES")
    tables = [t[0] for t in cur.fetchall()]
    print("Tables:", tables)
    
    if "predictions" in tables:
        cur.execute("DESCRIBE predictions")
        print("\nPredictions Schema:")
        for row in cur.fetchall():
            print(row)
    else:
        print("\nPredictions table MISSING!")
        
    conn.close()
except Exception as e:
    print("Error:", e)
