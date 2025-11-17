# Fix: RSVP API Endpoint Not Configured

## The Problem
Your deployed app shows: "RSVP API endpoint is not configured. Your RSVP cannot be saved."

This happens because `VITE_RSVP_API_URL` was not set during the Docker build.

## Quick Fix Steps

### Step 1: Get Your Google Apps Script URL

1. Go to [Google Apps Script](https://script.google.com/home)
2. Open your RSVP API project
3. Click **Deploy** → **Manage deployments**
4. Find your Web app deployment
5. Copy the **Web app URL** (must end with `/exec`)
   - Example: `https://script.google.com/macros/s/AKfycbz_w-at4yiCdxlQBcXIWnzdUPFurc2-JOAX7jYSjLnucKfVi-ASO6JehY-zX3IF-XUK/exec`

### Step 2: Redeploy with the Environment Variable

**Option A: Using Cloud Build (Recommended)**

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_REGION=us-central1,_VITE_RSVP_API_URL="https://script.google.com/macros/s/AKfycbz_w-at4yiCdxlQBcXIWnzdUPFurc2-JOAX7jYSjLnucKfVi-ASO6JehY-zX3IF-XUK/exec"
```

**Option B: Update Cloud Build Trigger**

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Find your trigger
3. Click **Edit**
4. Scroll to **Substitution variables**
5. Add/Update:
   - **Variable:** `_VITE_RSVP_API_URL`
   - **Value:** Your Google Apps Script URL (from Step 1)
6. Click **Save**
7. Push a commit or manually trigger the build

### Step 3: Verify the Fix

1. Wait for the build to complete
2. Open your deployed app
3. Press F12 (open browser console)
4. Look for: `RSVP API Endpoint: https://script.google.com/...`
5. If you see the URL (not "NOT CONFIGURED"), it's fixed!

## Important Notes

⚠️ **Setting environment variables in Cloud Run won't work!**
- Vite requires environment variables at BUILD time
- You MUST pass `VITE_RSVP_API_URL` as a build argument
- Runtime environment variables won't help

## Test Your Google Apps Script URL

Before deploying, test your URL:

```bash
curl "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

Should return: `{"success":true,"data":[]}`

If you get an error:
- Make sure the script is deployed (not just saved)
- Check "Who has access" is set to "Anyone"
- Verify the URL ends with `/exec` (not `/dev`)

