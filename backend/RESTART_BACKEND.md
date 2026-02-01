# How to Restart Backend Service

## Quick Restart

If the backend service stops (e.g., after Ctrl+C), restart it with:

```bash
cd backend
npm run dev
```

## Verify It's Running

### Check Port
```bash
lsof -i :3000
```

### Test Health Endpoint
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "IDSS Backend",
  "timestamp": "2024-..."
}
```

## Common Issues

### Port Already in Use
If port 3000 is already in use:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 <PID>
```

Or change the port in `backend/.env`:
```env
PORT=3001
```

### Missing Dependencies
```bash
cd backend
npm install
```

### Missing Environment Variables
Create `backend/.env`:
```env
OPENAI_API_KEY=your-api-key-here
PORT=3000
NODE_ENV=development
```

## Background Process

To run backend in background (Linux/Mac):
```bash
cd backend
nohup npm run dev > backend.log 2>&1 &
```

To stop:
```bash
pkill -f "tsx watch src/index.ts"
```

## Development Mode

The `npm run dev` command uses `tsx watch` which:
- Automatically restarts on file changes
- Shows TypeScript errors in real-time
- Runs in development mode

## Production Mode

For production:
```bash
cd backend
npm run build
npm start
```
