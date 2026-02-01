# Verification: Button Link to n8n Webhook

## ✅ Confirmation

**YES**, the "RUN SCENARIO ANALYSIS" button is connected to:
```
http://localhost:5678/webhook/trigger-scan
```

## Code Verification

### 1. Button Handler
**File:** `src/app/App.tsx`
- Button calls: `handleRunAnalysis()`
- Which calls: `runAnalysis()` from `analysisService.ts`

### 2. Analysis Service
**File:** `src/services/analysisService.ts`

**Line 2:** Defines the webhook URL
```typescript
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/trigger-scan';
```

**Line 65-68:** Uses the webhook URL when USE_N8N is true
```typescript
if (USE_N8N) {
  // Call n8n webhook
  console.log('Calling n8n webhook:', N8N_WEBHOOK_URL);
  const response = await fetch(N8N_WEBHOOK_URL, {
```

**Line 4:** Defaults to using n8n
```typescript
const USE_N8N = import.meta.env.VITE_USE_N8N !== 'false'; // Default to true if not set
```

## Flow Diagram

```
User clicks "RUN SCENARIO ANALYSIS"
    ↓
handleRunAnalysis() in App.tsx (line 1093)
    ↓
runAnalysis() in analysisService.ts (line 63)
    ↓
Checks: USE_N8N === true? (default: YES)
    ↓
YES → fetch(N8N_WEBHOOK_URL)
    ↓
N8N_WEBHOOK_URL = "http://localhost:5678/webhook/trigger-scan"
    ↓
POST request sent to: http://localhost:5678/webhook/trigger-scan ✅
```

## Default Configuration

**Without any `.env` file:**
- ✅ `N8N_WEBHOOK_URL` = `http://localhost:5678/webhook/trigger-scan`
- ✅ `USE_N8N` = `true`
- ✅ Button will call n8n webhook

## How to Verify in Browser

### Method 1: Console Log
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "RUN SCENARIO ANALYSIS" button
4. Look for: `Calling n8n webhook: http://localhost:5678/webhook/trigger-scan`

### Method 2: Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click "RUN SCENARIO ANALYSIS" button
4. Find request to: `trigger-scan`
5. Check Request URL: Should be `http://localhost:5678/webhook/trigger-scan`

## Override (Optional)

If you want to change the URL, create `.env` file:

```env
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/trigger-scan
VITE_USE_N8N=true
```

Then restart frontend.

## Conclusion

✅ **Confirmed:** Button is linked to `http://localhost:5678/webhook/trigger-scan`

The connection is correct by default. If you're having issues, it's likely:
- n8n not running
- Workflow not activated
- CORS errors
- Network issues

But the button link itself is correct! ✅
