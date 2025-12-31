#!/bin/bash

# YouTube Thumbnail Generator - Startup Script
# Usage: ./start.sh

set -e

echo "======================================"
echo "  Thumbnail Generator - Starting..."
echo "======================================"

# Check for .env file
if [ ! -f .env ]; then
    echo ""
    echo "Warning: .env file not found!"
    echo "Copy .env.example to .env and add your GEMINI_API_KEY"
    echo ""
fi

# Create data directories if they don't exist
mkdir -p data/templates data/assets/backgrounds data/assets/fonts data/assets/overlays data/outputs

# Install backend dependencies if needed
if [ ! -d "backend/__pycache__" ]; then
    echo ""
    echo "Installing backend dependencies..."
    pip install -r backend/requirements.txt
fi

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo ""
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "Starting services..."
echo ""

# Start backend in background
echo "[Backend] Starting FastAPI on http://localhost:8000"
cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Give backend a moment to start
sleep 2

# Start frontend
echo "[Frontend] Starting Vite on http://localhost:5173"
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "======================================"
echo "  Services Started!"
echo "======================================"
echo ""
echo "  UI:  http://localhost:5173"
echo "  API: http://localhost:8000"
echo "  Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Handle shutdown
cleanup() {
    echo ""
    echo "Shutting down..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait
