# Quick Test Guide - OpenAI API

## If the "API Test" menu item doesn't work, try these methods:

### Method 1: Use the Quick Test Button
1. Go to the **Situation Room** (main page)
2. Look at the right panel
3. You'll see a green **"TEST OPENAI API"** button at the top
4. Click it to go to the test page

### Method 2: Browser Console Test

Open browser console (F12 or Cmd+Option+I) and run:

```javascript
// Quick test function
async function testOpenAI() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  console.log('🔍 Checking API Key...');
  console.log('Configured:', apiKey ? 'Yes' : 'No');
  console.log('Prefix:', apiKey ? apiKey.substring(0, 10) + '...' : 'Not set');
  
  if (!apiKey) {
    console.error('❌ API key not found. Check your .env file.');
    return;
  }
  
  if (!apiKey.startsWith('sk-')) {
    console.warn('⚠️ API key format may be incorrect (should start with "sk-")');
  }
  
  try {
    console.log('📡 Testing API connection...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Say "API connection successful" if you can read this.' }],
        max_tokens: 50,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! API is connected!');
      console.log('Response:', data.choices[0]?.message?.content);
      console.log('Model:', data.model);
      console.log('Tokens used:', data.usage?.total_tokens);
    } else {
      const error = await response.json();
      console.error('❌ API Error:', error);
    }
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

// Run the test
testOpenAI();
```

### Method 3: Direct URL Access

If the menu doesn't work, you can manually change the screen state:

1. Open browser console
2. Run: `window.location.hash = '#api-test'`
3. Or use React DevTools to change the state

### Method 4: Check .env File

1. Make sure `.env` file exists in project root
2. Content should be:
   ```
   VITE_OPENAI_API_KEY=sk-proj-...
   ```
3. Restart dev server after creating/modifying `.env`

### Troubleshooting

**If button doesn't appear:**
- Check browser console for errors
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Check if dev server is running

**If test fails:**
- Verify API key is correct
- Check network tab for failed requests
- Ensure API key has credits/quota
