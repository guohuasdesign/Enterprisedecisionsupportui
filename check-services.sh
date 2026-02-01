#!/bin/bash

echo "🔍 Checking IDSS Services Status..."
echo ""

# Check Frontend (Vite)
echo "📱 Frontend (Vite):"
if lsof -i :5173 > /dev/null 2>&1; then
    echo "  ✅ Running on port 5173"
    lsof -i :5173 | grep LISTEN
else
    echo "  ❌ Not running on port 5173"
fi

echo ""

# Check Backend (Node.js)
echo "🔧 Backend (Node.js):"
if lsof -i :3000 > /dev/null 2>&1; then
    echo "  ✅ Running on port 3000"
    lsof -i :3000 | grep LISTEN
    
    # Test health endpoint
    echo ""
    echo "  Testing health endpoint..."
    curl -s http://localhost:3000/health | head -3 || echo "  ⚠️  Health check failed"
else
    echo "  ❌ Not running on port 3000"
    echo ""
    echo "  To start backend:"
    echo "    cd backend"
    echo "    npm run dev"
fi

echo ""
echo "📊 Summary:"
FRONTEND=$(lsof -i :5173 > /dev/null 2>&1 && echo "✅" || echo "❌")
BACKEND=$(lsof -i :3000 > /dev/null 2>&1 && echo "✅" || echo "❌")

echo "  Frontend: $FRONTEND"
echo "  Backend:  $BACKEND"
