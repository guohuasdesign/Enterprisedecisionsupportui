# N8N Workflow Integration

## Overview

The frontend is now configured to call the n8n workflow webhook instead of the Node.js backend. The "RUN SCENARIO ANALYSIS" button on the Situation Room page will trigger your n8n workflow.

## Configuration

### Environment Variables

Add to your `.env` file in the project root:

```env
# N8N Webhook URL (Required)
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/trigger-scan

# Use n8n instead of backend (default: true)
# Set to 'false' to use Node.js backend instead
VITE_USE_N8N=true
```

### Default Behavior

- If `VITE_USE_N8N` is not set or is `'true'`, the frontend will call n8n webhook
- If `VITE_USE_N8N` is `'false'`, the frontend will call the Node.js backend

## How It Works

1. **User clicks "RUN SCENARIO ANALYSIS"** button on Situation Room page
2. **Frontend sends POST request** to n8n webhook URL:
   ```javascript
   POST http://localhost:5678/webhook/trigger-scan
   Content-Type: application/json
   
   {
     "vessel": "Elbe Feeder",
     "request_time": "2026-01-31T12:00:00.000Z"
   }
   ```
3. **N8N workflow processes** the request through all nodes
4. **N8N returns response** from "Respond to Webhook" node
5. **Frontend transforms** n8n response to match expected format
6. **Results displayed** in Scenario Lab

## N8N Workflow Requirements

### Webhook Node Configuration

- **HTTP Method**: POST
- **Path**: `trigger-scan`
- **Response Mode**: `responseNode` (connected to "Respond to Webhook" node)
- **CORS**: Enable CORS headers if needed:
  - `Access-Control-Allow-Origin: *`

### Response Format

The n8n workflow should return JSON with at least one of:

1. **Scenarios format** (preferred):
   ```json
   {
     "strategies": [
       {
         "method": "Strategy Name",
         "tactical_steps": "Steps to take",
         "why_it_works": "Explanation",
         "estimated_loss_reduction": "EUR 50000",
         "ai_confidence_score": "85%",
         "feasibility_data": "Search-backed data"
       }
     ],
     "vessel_cargo_summary": "The vessel Elbe Feeder contains..."
   }
   ```

2. **Or any format** - the frontend will attempt to transform it

### Activate Workflow

**Important**: Make sure your n8n workflow is **activated** (production mode):
1. Open n8n workflow editor
2. Click "Activate" toggle in top right
3. Verify webhook URL shows "Production URL" tab

## Testing

### 1. Start n8n

```bash
# Make sure n8n is running
# Default: http://localhost:5678
```

### 2. Activate Workflow

- Open n8n UI
- Load your workflow (`My workflow.json`)
- Click "Activate" toggle
- Copy Production URL: `http://localhost:5678/webhook/trigger-scan`

### 3. Test from Frontend

1. Start frontend: `npm run dev`
2. Open http://localhost:5173
3. Go to Situation Room
4. Click "RUN SCENARIO ANALYSIS"
5. Wait for n8n to process (may take 10-30 seconds)
6. Results should appear in Scenario Lab

### 4. Test with curl

```bash
curl -X POST http://localhost:5678/webhook/trigger-scan \
  -H "Content-Type: application/json" \
  -d '{"vessel": "Elbe Feeder", "request_time": "2026-01-31T12:00:00.000Z"}'
```

## Troubleshooting

### CORS Errors

If you see CORS errors in browser console:

1. In n8n Webhook node, click "Add Option"
2. Select "HTTP Response Headers"
3. Add: `Access-Control-Allow-Origin: *`

### Timeout Issues

n8n workflows can take 10-30 seconds. The frontend `fetch` will wait, but if you see timeouts:

1. Check n8n workflow logs for errors
2. Verify all API keys are configured in n8n
3. Check network tab in browser DevTools

### Response Format Issues

If scenarios don't appear:

1. Check browser console for full n8n response
2. Verify n8n "Respond to Webhook" node returns valid JSON
3. Check that response includes `strategies` or `mitigation_strategies` array

### Workflow Not Activated

If you get 404 or connection errors:

1. Verify workflow is activated in n8n
2. Check webhook URL matches exactly: `http://localhost:5678/webhook/trigger-scan`
3. Try the Production URL from n8n UI

## Switching Back to Backend

To use Node.js backend instead of n8n:

1. Set in `.env`:
   ```env
   VITE_USE_N8N=false
   ```

2. Restart frontend: `npm run dev`

3. Make sure backend is running: `cd backend && npm run dev`

## Response Transformation

The frontend automatically transforms n8n responses:

- `strategies` → `scenarios` array
- Extracts `method`, `tactical_steps`, `why_it_works`, etc.
- Maps to expected `AnalysisResponse` format
- Preserves original n8n data in response object

## Next Steps

1. ✅ Configure `.env` with `VITE_N8N_WEBHOOK_URL`
2. ✅ Activate n8n workflow
3. ✅ Test from frontend
4. ✅ Verify results appear correctly

---

**Status**: ✅ Frontend configured to call n8n webhook!
