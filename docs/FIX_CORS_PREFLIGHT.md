# Fix CORS Preflight Error

## The Problem

You're seeing this error:
```
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

This happens when the browser sends an OPTIONS request (preflight) before the actual POST request, and the server doesn't respond with CORS headers.

## The Solution

Google Apps Script should automatically handle CORS when deployed correctly, but sometimes it needs to be redeployed. Follow these steps:

### Step 1: Verify Deployment Settings (CRITICAL)

1. Open your Google Apps Script editor
2. Go to **Deploy** → **Manage deployments**
3. Click the **edit icon** (pencil) next to your deployment
4. **VERIFY** these settings:
   - **Execute as**: `Me` (your Google account)
   - **Who has access**: `Anyone` ← **THIS IS CRITICAL**
5. If "Who has access" is NOT "Anyone", change it to "Anyone"
6. Click **Deploy**

### Step 2: Create a New Deployment Version

Even if settings look correct, create a fresh deployment:

1. In **Deploy** → **Manage deployments**
2. Click **edit** (pencil icon)
3. Under "Version", select **New version**
4. Make sure "Who has access" is **Anyone**
5. Click **Deploy**
6. **Authorize again** if prompted

### Step 3: Test the OPTIONS Endpoint Directly

Test if the OPTIONS endpoint works:

1. Open a new browser tab
2. Go to: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`
3. Open Developer Tools (F12)
4. Go to **Network** tab
5. In the browser console, run:
   ```javascript
   fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', {
     method: 'OPTIONS',
     mode: 'cors'
   }).then(r => r.text()).then(console.log).catch(console.error);
   ```
6. Check the Network tab - the OPTIONS request should return status 200
7. Check Response Headers - should include `Access-Control-Allow-Origin: *`

### Step 4: Verify the Script Code

Make sure your `doOptions()` function is correct:

```javascript
function doOptions() {
  return ContentService.createTextOutput('');
}
```

This function should exist in your script. Google Apps Script will automatically add CORS headers to the response when deployed with "Anyone" access.

### Step 5: Restart Dev Server

After redeploying:

1. Stop your dev server (Ctrl+C)
2. Restart: `npm run dev`
3. Clear browser cache or use incognito mode
4. Test the RSVP form again

## Why This Happens

- POST requests with `Content-Type: application/json` trigger a preflight OPTIONS request
- The browser checks if the server allows cross-origin requests
- Google Apps Script only adds CORS headers automatically when:
  - Deployed (not just saved)
  - "Who has access" is "Anyone"
  - The script is properly authorized

## Alternative: Check Deployment URL

Make sure you're using the `/exec` URL (production), not `/dev`:

- ✅ Correct: `https://script.google.com/macros/s/SCRIPT_ID/exec`
- ❌ Wrong: `https://script.google.com/macros/s/SCRIPT_ID/dev`

The `/dev` URL is for testing and doesn't have CORS enabled.

## Still Not Working?

1. **Check execution logs**:
   - In Apps Script editor, click **Executions** (left sidebar)
   - Look for any errors in recent executions

2. **Try a different browser**:
   - Some browser extensions block CORS
   - Try Chrome in incognito mode

3. **Verify the endpoint works in browser**:
   - Direct GET should return: `{"success":true,"data":[]}`
   - If this works but POST doesn't, it's a CORS/preflight issue

4. **Double-check deployment**:
   - The deployment must be active
   - "Who has access" MUST be "Anyone" (not "Only myself")

