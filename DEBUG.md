# Debug Guide

## Common Issues and Solutions

### White Screen / Blank Page

1. **Check Browser Console**
   - Open Developer Tools (F12 or Cmd+Option+I)
   - Look for red error messages in the Console tab
   - Common errors:
     - `Cannot find module` - Import path issue
     - `XXX is not defined` - Missing import
     - `Cannot read property` - Null/undefined error

2. **Check Network Tab**
   - Look for failed requests (red status codes)
   - Check if main.js or other assets are loading

3. **Check Terminal**
   - Look for compilation errors in the Vite dev server
   - Common issues:
     - TypeScript errors
     - Missing dependencies
     - Port already in use

### Common Error Messages

#### "Cannot find module '../components/OpenAITest'"
**Solution**: Check that the file exists at `src/components/OpenAITest.tsx`

#### "OPENAI_API_KEY is not defined"
**Solution**: Check that `.env` file exists and contains `VITE_OPENAI_API_KEY=...`

#### "Failed to fetch" or CORS errors
**Solution**: This is normal for OpenAI API calls from browser - may need backend proxy

#### "Module not found" errors
**Solution**: Run `npm install` to ensure all dependencies are installed

## Quick Fixes

1. **Restart Dev Server**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   ```

2. **Clear Browser Cache**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

3. **Reinstall Dependencies**
   ```bash
   rm -rf node_modules
   npm install
   ```

4. **Check .env File**
   - Ensure `.env` file exists in project root
   - Format: `VITE_OPENAI_API_KEY=sk-...`
   - No quotes around the value
   - Restart dev server after creating/modifying .env

## Getting Help

When reporting issues, please include:
1. Full error message from browser console
2. Screenshot of the error (if possible)
3. Steps to reproduce
4. Browser and OS version
