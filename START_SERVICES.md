# Frontend and Backend Service Startup Guide

## Check Service Status

Run the following commands in the terminal to check if services are running:

```bash
# Check frontend (port 5173)
lsof -i :5173

# Check backend (port 3000)
lsof -i :3000
```

## Start Frontend Service

```bash
# In project root directory
cd "/Users/huaguo/MyFirstDirectory/Hachathon/Cursor AI Hachaton/Projekt 2_IDSS/Test_IDSS/Enterprisedecisionsupportui"

# Start Vite development server
npm run dev
```

Frontend service will start at `http://localhost:5173`

## Start Backend Service

```bash
# Navigate to backend directory
cd "/Users/huaguo/MyFirstDirectory/Hachathon/Cursor AI Hachaton/Projekt 2_IDSS/Test_IDSS/Enterprisedecisionsupportui/backend"

# Ensure dependencies are installed
npm install

# Start backend service
npm run dev
```

Backend service will start at `http://localhost:3000`

## Start Both Services Simultaneously

Open two terminal windows:

**Terminal 1 - Frontend:**
```bash
cd "/Users/huaguo/MyFirstDirectory/Hachathon/Cursor AI Hachaton/Projekt 2_IDSS/Test_IDSS/Enterprisedecisionsupportui"
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd "/Users/huaguo/MyFirstDirectory/Hachathon/Cursor AI Hachaton/Projekt 2_IDSS/Test_IDSS/Enterprisedecisionsupportui/backend"
npm run dev
```

## Verify Services Are Running

### Frontend
Open browser and visit: `http://localhost:5173`

### Backend
```bash
# Health check
curl http://localhost:3000/health

# Test analysis endpoint
curl -X POST http://localhost:3000/run-analysis -H "Content-Type: application/json" -d '{}'
```

## Current Status

Based on checks:
- ✅ **Frontend**: Process running on port 5173
- ❌ **Backend**: No service running on port 3000

**Backend service needs to be started!**
