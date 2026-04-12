# HealAI Full Project

HealAI is a full stack AI-assisted health diagnostic platform.

## Stack
- Frontend: React + TypeScript + Vite
- Backend: Flask + SQLite
- ML Models: Diabetes, Heart, Kidney, Liver

## Local Setup

### 1) Backend
```bash
cd backend
py -m pip install -r requirements.txt
py app.py
```

Backend runs on `http://127.0.0.1:5000`.

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` (or next available port).

## Environment Variables

Copy `.env.example` and set values:
- `VITE_API_URL`: backend base URL
- `VITE_GEMINI_API_KEY`: Gemini API key
- `JWT_SECRET`: backend JWT secret
- `PORT`: backend port
- `DB_PATH`: SQLite database path

## Validation Commands

### Frontend
```bash
cd frontend
npm run typecheck
npm run build
```

### Backend
```bash
cd backend
py -m compileall .
py -u test_all_models.py
```

## Deployment

### Vercel (Frontend)
- Use `frontend/` as project root.
- Build command: `npm run build`
- Output directory: `dist`
- Set env vars:
  - `VITE_API_URL=https://<your-render-backend>.onrender.com`
  - `VITE_GEMINI_API_KEY=<your_key>`

### Render (Backend)
- Use `backend/` as root directory.
- Build command: `pip install -r requirements.txt`
- Start command: `python app.py`
- Set env vars:
  - `JWT_SECRET`
  - `PORT`
  - `FLASK_DEBUG=0`
  - `DB_PATH=healai.db`

`render.yaml` is included for one-click service setup.
