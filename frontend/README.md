# HealAI: Disease Prediction Suite
Last updated: July 6, 2026

A high-fidelity health diagnostic simulation using Gemini AI and Machine Learning models to analyze clinical parameters for Diabetes, Heart, Kidney, and Liver conditions.

## Project Structure
- **frontend/**: React + Vite application with a beautiful, high-performance UI.
- **backend/**: Flask API serving ML models (Scikit-learn).

## Setup Instructions

### 1. Backend Setup (Python)
The backend hosts the prediction models.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the Flask server:
   ```bash
   python app.py
   ```
   The server will start on `http://127.0.0.1:5000`.

### 2. Frontend Setup (Node.js)
The frontend provides the user interface.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment:
   - Ensure `.env.local` contains your `GEMINI_API_KEY`.
4. Run the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` (or the port shown in terminal).

## Features
- **Multi-Disease Support**: Diabetes, Heart, Kidney, Liver.
- **Smart UI**: Sectioned forms, progress tracking, and quick-fill for testing.
- **AI Analysis**: Gemini AI provides detailed health insights based on predictions.
- **Local ML**: Scikit-learn models run locally for privacy and speed.
