# Fix 405 Method Not Allowed Error on OPTIONS Request

## The Problem

You're seeing:
- **405 (Method Not Allowed)** on the preflight OPTIONS request
- **CORS error** on the actual POST request

This means the browser's preflight check is failing before the actual request can be made.

## The Solution

### Step 1: Verify Deployment Settings (CRITICAL)

The deployment **MUST** be set to allow anonymous access:

1. Open your Google Apps Script editor
2. Go to **Deploy** → **Manage deployments**
3. Click the **edit icon** (pencil) next to your deployment
4. **VERIFY** these settings:
   - **Execute as**: `Me` (your Google account)
   - **Who has access**: `Anyone` or `Anyone, even anonymous` ← **THIS IS CRITICAL**
5. If it's not set to "Anyone", change it
6. Under "Version", select **New version**
7. Click **Deploy**

### Step 2: Redeploy the Script

After changing settings, you MUST create a new deployment:

1. In **Deploy** → **Manage deployments**
2. Click **edit** (pencil icon)
3. Select **New version**
4. Ensure "Who has access" is **Anyone** or **Anyone, even anonymous**
5. Click **Deploy**
6. **Authorize again** if prompted

### Step 3: Test the OPTIONS Endpoint

Test if OPTIONS works directly:

1. Open a new browser tab
2. Open Developer Tools (F12)
3. Go to **Console** tab
4. Run this:
   ```javascript
   fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', {
     method: 'OPTIONS',
     mode: 'cors'
   }).then(r => {
     console.log('Status:', r.status);
     console.log('Headers:', [...r.headers.entries()]);
     return r.text();
   }).then(console.log).catch(console.error);
   ```

**Expected result**: Status 200, with CORS headers in the response.

### Step 4: Alternative Workaround (If Still Failing)

If the deployment settings are correct but you still get 405, try changing the frontend to use `text/plain` instead of `application/json`:

This avoids the preflight request entirely. However, you'll need to update the Google Apps Script to parse `text/plain` instead of JSON.

## Why This Happens

- POST requests with `Content-Type: application/json` trigger a preflight OPTIONS request
- Google Apps Script only handles OPTIONS automatically when deployed with "Anyone" or "Anyone, even anonymous" access
- If the deployment is set to "Only myself", OPTIONS requests return 405

## Most Common Fix

**99% of the time, this is fixed by:**
1. Setting "Who has access" to **Anyone** or **Anyone, even anonymous**
2. Creating a **New version** deployment
3. Redeploying

