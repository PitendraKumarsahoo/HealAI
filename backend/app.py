
from flask import Flask, request, jsonify, g, send_file
from flask_cors import CORS
import pickle
import numpy as np
import os
import jwt
import datetime
import sqlite3
import pandas as pd
import io
from werkzeug.security import generate_password_hash, check_password_hash

# Mock model class for newly added diseases without real pkl files
class MockModel:
    def predict(self, X):
        return np.array([1 if np.mean(X) > 0.5 else 0])
    def predict_proba(self, X):
        p = 0.7 # Mock probability
        return np.array([[1-p, p]])

app = Flask(__name__)
CORS(app)
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret")
DB_PATH = os.environ.get("DB_PATH", "healai.db")

# Database setup function
def setup_database():
    if not os.path.exists(DB_PATH):
        print(f"Creating database {DB_PATH}...")
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Create users table
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

        # Create predictions table
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
        
        conn.commit()
        conn.close()
        print("Database setup completed!")

# Initialize database on app startup
setup_database()

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def db_conn():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = dict_factory
    return conn

def create_token(user):
    payload = {
        "sub": str(user["id"]),
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_token(token):
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

def auth_required(fn):
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401
        token = auth.split(" ")[1]
        try:
            data = decode_token(token)
            g.user = data
        except Exception as e:
            print(f"Auth Error: {e}")
            return jsonify({"error": "Unauthorized"}), 401
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper

def role_required(roles):
    def decorator(fn):
        def wrapper(*args, **kwargs):
            auth = request.headers.get("Authorization", "")
            if not auth.startswith("Bearer "):
                return jsonify({"error": "Unauthorized"}), 401
            token = auth.split(" ")[1]
            try:
                data = decode_token(token)
                if data.get("role") not in roles:
                    return jsonify({"error": "Forbidden"}), 403
                g.user = data
            except Exception:
                return jsonify({"error": "Unauthorized"}), 401
            return fn(*args, **kwargs)
        wrapper.__name__ = fn.__name__
        return wrapper
    return decorator

models = {
    "diabetes": pickle.load(open("models/diabete.pkl", "rb")),
    "heart": pickle.load(open("models/heartl.pkl", "rb")),
    "kidney": pickle.load(open("models/kidney.pkl", "rb")),
    "liver": pickle.load(open("models/liver.pkl", "rb")),
    "stroke": pickle.load(open("models/stroke.pkl", "rb")) if os.path.exists("models/stroke.pkl") else None,
    "ckd": pickle.load(open("models/ckd.pkl", "rb")) if os.path.exists("models/ckd.pkl") else None,
}

def run_prediction(disease, data):
    model = models.get(disease)
    if not model:
        return 0, 0.1

    feature_vector = np.array(data, dtype=float)
    expected_features = getattr(model, "n_features_in_", None)
    if expected_features is not None and feature_vector.shape[0] != expected_features:
        if disease in ["kidney", "ckd"] and feature_vector.shape[0] == expected_features + 1:
            feature_vector = feature_vector[1:]
        elif feature_vector.shape[0] > expected_features:
            feature_vector = feature_vector[:expected_features]
        else:
            feature_vector = np.pad(feature_vector, (0, expected_features - feature_vector.shape[0]), mode="constant")

    prediction = model.predict([feature_vector])
    if disease in ['liver', 'kidney']:
        probability = model.predict_proba([feature_vector])[0][0]
    else:
        probability = model.predict_proba([feature_vector])[0][1]
    return int(prediction[0]), float(probability)

@app.route("/auth/register", methods=["POST"])
def register():
    payload = request.get_json(force=True) or {}
    name = payload.get("name", "").strip()
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")
    if not name or not email or not password:
        return jsonify({"error": "Missing fields"}), 400
    conn = db_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE email=?", (email,))
        existing = cur.fetchone()
        if existing:
            return jsonify({"error": "Email already registered"}), 400
        pwd = generate_password_hash(password)
        cur.execute(
            "INSERT INTO users (name, email, password_hash, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))",
            (name, email, pwd, "USER", 1)
        )
        conn.commit()
        cur.execute("SELECT id, email, role, name FROM users WHERE email=?", (email,))
        user = cur.fetchone()
        token = create_token(user)
        return jsonify({"token": token, "role": user["role"], "name": user["name"]})
    finally:
        conn.close()

@app.route("/auth/login", methods=["POST"])
def login():
    payload = request.get_json(force=True) or {}
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")
    if not email or not password:
        return jsonify({"error": "Missing fields"}), 400
    conn = db_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name, email, password_hash, role, is_active FROM users WHERE email=?", (email,))
        user = cur.fetchone()
        if not user or not user["is_active"] or not check_password_hash(user["password_hash"], password):
            return jsonify({"error": "Invalid credentials"}), 401
        token = create_token(user)
        return jsonify({"token": token, "role": user["role"], "name": user["name"]})
    finally:
        conn.close()

@app.route("/auth/me", methods=["GET"])
@auth_required
def me():
    conn = db_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name, email, role, created_at, is_active FROM users WHERE id=?", (g.user["sub"],))
        user = cur.fetchone()
        return jsonify(user or {})
    finally:
        conn.close()

@app.route("/predict/<disease>", methods=["POST"])
@auth_required
def predict(disease):
    if disease not in models:
        return jsonify({"error": "Invalid disease"}), 400

    data = request.json.get("features")
    patient_name = request.json.get("patientName")
    if not data:
        return jsonify({"error": "No features provided"}), 400

    try:
        prediction, probability = run_prediction(disease, data)
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 400
    conn = db_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO predictions (user_id, disease, prediction, probability, patient_name, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))",
            (g.user["sub"], disease, int(prediction), float(probability), patient_name)
        )
        conn.commit()
    finally:
        conn.close()
    return jsonify({
        "prediction": prediction,
        "probability": probability
    })

@app.route("/predict/public/<disease>", methods=["POST"])
def predict_public(disease):
    if disease not in models:
        return jsonify({"error": "Invalid disease"}), 400
    data = request.json.get("features")
    if not data:
        return jsonify({"error": "No features provided"}), 400
    try:
        prediction, probability = run_prediction(disease, data)
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 400
    return jsonify({
        "prediction": prediction,
        "probability": probability
    })

@app.route("/predictions/my", methods=["GET"])
@auth_required
def my_predictions():
    conn = db_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, disease, prediction, probability, patient_name, created_at FROM predictions WHERE user_id=? ORDER BY created_at DESC",
            (g.user["sub"],)
        )
        rows = cur.fetchall()
        return jsonify(rows)
    finally:
        conn.close()

@app.route("/predictions/all", methods=["GET"])
@role_required(["ADMIN", "MEDICAL"])
def all_predictions():
    conn = db_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT p.id, p.disease, p.prediction, p.probability, p.patient_name, p.created_at, u.id as user_id, u.name as user_name, u.email FROM predictions p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC"
        )
        rows = cur.fetchall()
        return jsonify(rows)
    finally:
        conn.close()

@app.route("/admin/users", methods=["GET"])
@role_required(["ADMIN"])
def list_users():
    conn = db_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC")
        rows = cur.fetchall()
        return jsonify(rows)
    finally:
        conn.close()

@app.route("/admin/users/<int:user_id>/role", methods=["PUT"])
@role_required(["ADMIN"])
def update_user_role(user_id):
    payload = request.get_json(force=True) or {}
    role = payload.get("role")
    if role not in ["USER", "MEDICAL", "ADMIN"]:
        return jsonify({"error": "Invalid role"}), 400
    conn = db_conn()
    try:
        cur = conn.cursor()
        cur.execute("UPDATE users SET role=? WHERE id=?", (role, user_id))
        conn.commit()
        return jsonify({"status": "ok"})
    finally:
        conn.close()

@app.route("/admin/users/<int:user_id>", methods=["DELETE"])
@role_required(["ADMIN"])
def delete_user(user_id):
    conn = db_conn()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM users WHERE id=?", (user_id,))
        conn.commit()
        return jsonify({"status": "ok"})
    finally:
        conn.close()

@app.route("/admin/export-data", methods=["GET"])
@role_required(["ADMIN"])
def export_data():
    conn = db_conn()
    try:
        # Fetch all predictions with user info
        query = """
            SELECT 
                p.id as prediction_id,
                p.disease,
                p.prediction,
                p.probability,
                p.patient_name,
                p.created_at as prediction_date,
                u.id as user_id,
                u.name as user_name,
                u.email as user_email,
                u.role as user_role
            FROM predictions p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC
        """
        df = pd.read_sql(query, conn)
        
        # Create Excel file in memory
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='All Data')
        
        output.seek(0)
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'healai_data_export_{datetime.datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
        )
    except Exception as e:
        print(f"Export Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)
