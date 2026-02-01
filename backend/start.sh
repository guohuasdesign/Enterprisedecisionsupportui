#!/bin/bash

# IDSS Backend Startup Script

echo "🚀 Starting IDSS Backend..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the backend directory."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found."
    echo "   Create .env with: OPENAI_API_KEY=your-key"
    echo "   Continuing anyway..."
fi

# Start the server
echo "✅ Starting server on port ${PORT:-3000}..."
npm run dev
