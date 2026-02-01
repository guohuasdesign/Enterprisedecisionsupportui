# Test n8n Connection - Workflow is Activated ✅

## Your Status
✅ Workflow is activated in n8n
✅ Button is connected to: `http://localhost:5678/webhook/trigger-scan`

## Test the Connection

### Method 1: Test from Frontend (Recommended)

1. **Open your frontend**: http://localhost:5173
2. **Open browser DevTools** (Press F12)
3. **Go to Console tab** - to see logs
4. **Go to Network tab** - to see requests
5. **Navigate to Situation Room** page
6. **Click "RUN SCENARIO ANALYSIS"** button
7. **Watch the console** - you should see:
   ```
   Starting analysis...
   Calling n8n webhook: http://localhost:5678/webhook/trigger-scan
   ```
8. **Wait 10-30 seconds** (n8n workflows take time)
9. **Check results** - should appear in Scenario Lab or show in console

### Method 2: Test with curl (Terminal)

Open a terminal and run:

```bash
curl -X POST http://localhost:5678/webhook/trigger-scan \
  -H "Content-Type: application/json" \
  -d '{"vessel": "Elbe Feeder", "request_time": "2026-01-31T12:00:00.000Z"}'
```

**Expected Results:**
- ✅ **JSON response** → Webhook is working!
- ❌ **404 Not Found** → Workflow might not be activated (but you said it is)
- ❌ **Connection refused** → n8n is not running
- ❌ **Timeout** → Workflow is processing (normal, wait longer)

## What to Look For

### In Browser Console:
- ✅ `Calling n8n webhook: http://localhost:5678/webhook/trigger-scan`
- ✅ Response with data
- ❌ Error messages (CORS, 404, timeout, etc.)

### In Network Tab:
- ✅ Request to `trigger-scan`
- ✅ Status: 200 (success) or 202 (processing)
- ❌ Status: 404 (not found) or CORS error

## Common Issues & Fixes

### Issue: Still getting "Failed to fetch"

**Check:**
1. Is n8n running? Open http://localhost:5678 in browser
2. Is workflow really activated? Check n8n UI - should show "Active" (green)
3. Check browser console for specific error
4. Check CORS - might need to add headers in Webhook node

### Issue: CORS Error

**Fix:**
1. In n8n, click on **Webhook node**
2. Click **"Add Option"**
3. Select **"HTTP Response Headers"**
4. Add:
   - Name: `Access-Control-Allow-Origin`
   - Value: `*`
5. **Save workflow**
6. **Re-activate workflow** (toggle off and on)

### Issue: Timeout

**This is normal!** n8n workflows can take 10-30 seconds or more.
- Wait longer
- Check n8n execution logs to see if it's processing
- The frontend has a 60-second timeout

### Issue: 404 Not Found

Even though workflow is activated:
1. Double-check the webhook URL in n8n Webhook node
2. Make sure you're looking at **Production URL** (not Test URL)
3. Try re-activating the workflow

## Next Steps

1. ✅ Test from frontend UI
2. ✅ Check browser console for errors
3. ✅ If errors, check the specific error message
4. ✅ Fix CORS if needed
5. ✅ Wait for workflow to complete (10-30 seconds)

## Success Indicators

You'll know it's working when:
- ✅ Button shows "ANALYZING..." state
- ✅ Console shows webhook call
- ✅ After 10-30 seconds, results appear
- ✅ No error messages

---

**Try it now!** Click the button and check the browser console. 🚀
