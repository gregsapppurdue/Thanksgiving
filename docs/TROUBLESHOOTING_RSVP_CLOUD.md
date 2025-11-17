# Troubleshooting RSVP Feature in Google Cloud Run

## Problem: RSVPs appear to succeed but don't save to Google Sheets

If users can submit RSVPs without errors, but the data doesn't appear in your Google Sheet, follow these troubleshooting steps.

## Quick Diagnosis

### 1. Check Browser Console (Most Important)

Open your deployed app in a browser and check the browser console (F12 → Console tab):

**Look for these messages:**
- ✅ `RSVP API Endpoint: https://script.google.com/...` - Good! API is configured
- ❌ `RSVP API Endpoint: NOT CONFIGURED` - **Problem!** API URL not set during build
- ✅ `📤 Submitting RSVP to: ...` - Request is being sent
- ✅ `📥 Response status: 200` - Server responded successfully
- ✅ `✅ RSVP successfully saved:` - Data was saved

**If you see:**
- `❌ CRITICAL: VITE_RSVP_API_URL is not configured!` - The environment variable wasn't set during build
- `❌ Response error:` - The Google Apps Script is returning an error
- `❌ Failed to parse response as JSON:` - The server response format is wrong

### 2. Verify Environment Variable During Build

The `VITE_RSVP_API_URL` must be set **during the Docker build**, not at runtime. Vite embeds environment variables into the JavaScript bundle at build time.

**Check your Cloud Build logs:**
```bash
gcloud builds list --limit=1
gcloud builds log <BUILD_ID>
```

Look for:
- `ARG VITE_RSVP_API_URL` in Docker build step
- The actual URL value being passed

### 3. Test the Google Apps Script Directly

Test your Google Apps Script endpoint directly in a browser or with curl:

```bash
# Test GET (should return existing RSVPs)
curl "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"

# Test POST (should create a new RSVP)
curl -X POST "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"name":"Test User","item":"Test Item"}'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "id": "row_1",
    "name": "Test User",
    "item": "Test Item",
    ...
  }
}
```

### 4. Check Google Apps Script Execution Logs

1. Open your Google Apps Script project
2. Go to **Executions** (left sidebar)
3. Check recent executions for errors
4. Look for:
   - Permission errors
   - Spreadsheet access errors
   - Sheet name mismatches

### 5. Verify Google Sheet Permissions

1. Open your Google Sheet
2. Click **Share** button
3. Ensure the Google Apps Script has edit access
4. The script runs as "Me" (your account), so your account needs edit access

## Common Issues and Fixes

### Issue 1: Environment Variable Not Set During Build

**Symptoms:**
- Console shows: `RSVP API Endpoint: NOT CONFIGURED`
- Submissions appear to succeed but don't save

**Fix:**
Ensure `VITE_RSVP_API_URL` is passed as a build argument:

```bash
# Cloud Build
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_VITE_RSVP_API_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"

# Or update your Cloud Build trigger to include the substitution variable
```

**Verify in Dockerfile:**
```dockerfile
ARG VITE_RSVP_API_URL
ENV VITE_RSVP_API_URL=$VITE_RSVP_API_URL
```

### Issue 2: Google Apps Script Not Deployed Correctly

**Symptoms:**
- Console shows network errors
- Response status is not 200

**Fix:**
1. Open Google Apps Script editor
2. Click **Deploy** → **Manage deployments**
3. Ensure deployment is set to:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Copy the Web App URL (must end with `/exec`, not `/dev`)

### Issue 3: Sheet Name Mismatch

**Symptoms:**
- Google Apps Script logs show: "Sheet not found"

**Fix:**
1. Check the actual sheet tab name in your Google Sheet
2. Update `SHEET_NAME` in `RSVP_API.gs`:
   ```javascript
   const SHEET_NAME = 'Sheet1'; // Change to match your actual sheet name
   ```
3. Redeploy the Google Apps Script

### Issue 4: CORS Issues

**Symptoms:**
- Console shows CORS errors
- Network tab shows preflight failures

**Fix:**
- Ensure Google Apps Script is deployed with "Who has access: Anyone"
- The script already handles CORS automatically with this setting
- Don't manually set CORS headers (they're not supported)

### Issue 5: Silent Failures in Google Apps Script

**Symptoms:**
- Response status is 200, but `success: false` in response body

**Fix:**
1. Check Google Apps Script execution logs
2. Look for errors in `doPost` function
3. Common issues:
   - Spreadsheet ID incorrect
   - Sheet doesn't exist
   - Permission denied

## Step-by-Step Verification

### Step 1: Verify Build Configuration

```bash
# Check if environment variable is in build logs
gcloud builds log <BUILD_ID> | grep VITE_RSVP_API_URL
```

### Step 2: Verify Deployed App Configuration

1. Open your deployed app
2. Open browser console (F12)
3. Check the first log message: `RSVP API Endpoint: ...`
4. If it says "NOT CONFIGURED", the build didn't include the variable

### Step 3: Test API Endpoint Directly

```bash
# Replace with your actual script URL
curl -X POST "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"name":"Direct Test","item":"Test Item"}'
```

### Step 4: Check Google Sheet

1. Open your Google Sheet
2. Check if new rows are being added
3. Verify column structure matches the script expectations

## Debugging Checklist

- [ ] Browser console shows API endpoint is configured
- [ ] Browser console shows successful POST request
- [ ] Browser console shows successful response with `success: true`
- [ ] Google Apps Script execution logs show no errors
- [ ] Google Sheet has correct permissions
- [ ] Sheet name in script matches actual sheet tab name
- [ ] Spreadsheet ID in script is correct
- [ ] Google Apps Script is deployed (not just saved)
- [ ] Deployment URL ends with `/exec` (not `/dev`)
- [ ] Environment variable was set during Docker build

## Getting Help

If you're still having issues:

1. **Collect logs:**
   - Browser console logs (F12 → Console)
   - Browser network tab (F12 → Network → Filter by "exec")
   - Google Apps Script execution logs
   - Cloud Build logs

2. **Check these specific things:**
   - What does the browser console show for `RSVP API Endpoint:`?
   - What is the response status code?
   - What is the response body?
   - Are there any errors in Google Apps Script execution logs?

3. **Test the endpoint directly:**
   - Can you POST to the Google Apps Script URL directly?
   - Does it return a successful response?
   - Does the data appear in the Google Sheet?

## Prevention

To prevent this issue in the future:

1. **Always verify environment variables in build logs**
2. **Test the Google Apps Script endpoint directly after deployment**
3. **Check browser console in production for API endpoint status**
4. **Set up monitoring/alerts for failed RSVP submissions**

