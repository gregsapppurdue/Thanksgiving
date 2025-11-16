# Fix CORS Issue with Google Apps Script

## The Problem

You're seeing this error:
```
Access to fetch at 'https://script.google.com/...' from origin 'http://localhost:5175' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## The Solution

This happens when the Google Apps Script web app isn't configured correctly for CORS. Follow these steps:

### Step 1: Verify Deployment Settings

1. Open your Google Apps Script editor
2. Go to **Deploy** → **Manage deployments**
3. Click the **edit icon** (pencil) next to your deployment
4. **CRITICAL**: Make sure "Who has access" is set to **Anyone**
5. If it's not "Anyone", change it and click **Deploy**

### Step 2: Redeploy the Script

Even if settings look correct, redeploy:

1. In **Deploy** → **Manage deployments**
2. Click **edit** (pencil icon)
3. Change version to **New version**
4. Make sure "Who has access" is **Anyone**
5. Click **Deploy**
6. **Important**: You may need to authorize again - click "Authorize access"

### Step 3: Test Again

After redeploying:
1. Restart your dev server
2. Try accessing the RSVP section again
3. Check the browser console - the CORS error should be gone

## Why This Happens

Google Apps Script automatically adds CORS headers ONLY when:
- The web app is deployed (not just saved)
- "Who has access" is set to "Anyone"
- The script is properly authorized

If any of these aren't correct, CORS headers won't be sent.

## Alternative: Use a Proxy (If CORS Still Fails)

If CORS still doesn't work after redeploying, you can use a CORS proxy for development:

1. Update `.env` to use a CORS proxy:
   ```
   VITE_RSVP_API_URL=https://cors-anywhere.herokuapp.com/https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

   **Note**: This is only for development. For production, fix the CORS issue properly.

2. Or use a local proxy with Vite's proxy configuration

## Still Not Working?

1. **Check the Apps Script execution logs**:
   - In Apps Script editor, click **Executions** (left sidebar)
   - Look for any errors

2. **Verify the script is actually deployed**:
   - The URL should end with `/exec` (not `/dev`)
   - Test the URL directly in browser - should show JSON

3. **Try a different browser**:
   - Sometimes browser extensions block CORS
   - Try Chrome in incognito mode

4. **Check browser console Network tab**:
   - Look at the request to `script.google.com`
   - Check Response Headers - should include `Access-Control-Allow-Origin: *`

