# Quick Fix: RSVP API Endpoint Not Configured

## The Problem
You're seeing: "RSVP API endpoint is not configured. Your RSVP cannot be saved."

This means `VITE_RSVP_API_URL` was not set during the Docker build process.

## Solution: Set the Environment Variable During Build

### Option 1: Update Cloud Build Trigger (Recommended)

If you're using a Cloud Build trigger:

1. Go to [Google Cloud Console](https://console.cloud.google.com/cloud-build/triggers)
2. Find your trigger for this project
3. Click **Edit**
4. Scroll to **Substitution variables**
5. Add or update:
   - **Variable name:** `_VITE_RSVP_API_URL`
   - **Value:** `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`
     - Replace `YOUR_SCRIPT_ID` with your actual Google Apps Script Web App URL
6. Click **Save**
7. Push a new commit or manually trigger the build

### Option 2: Manual Deployment with Substitution

Deploy manually with the substitution variable:

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_REGION=us-central1,_VITE_RSVP_API_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

**Replace `YOUR_SCRIPT_ID` with your actual Google Apps Script URL.**

### Option 3: Find Your Google Apps Script URL

If you don't know your Google Apps Script URL:

1. Open your [Google Apps Script Dashboard](https://script.google.com/home)
2. Open your RSVP API project
3. Click **Deploy** → **Manage deployments**
4. Click the **Web app** deployment (or create one if it doesn't exist)
5. Copy the **Web app URL** (must end with `/exec`)
6. Ensure settings are:
   - **Execute as:** Me
   - **Who has access:** Anyone

### Option 4: Update Existing Service (Temporary Fix - Won't Work!)

⚠️ **Important:** Setting environment variables at runtime won't work because Vite embeds them at build time. You MUST rebuild the Docker image with the environment variable.

However, if you want to verify your Google Apps Script URL is correct, you can check the current service:

```bash
gcloud run services describe thanksgiving-app --region us-central1 --format="value(spec.template.spec.containers[0].env)"
```

But remember: **You must rebuild with the environment variable for it to work.**

## Verify the Fix

After redeploying:

1. Open your deployed app
2. Open browser console (F12)
3. Look for: `RSVP API Endpoint: https://script.google.com/...`
4. If you see the URL (not "NOT CONFIGURED"), the fix worked!

## Common Issues

### Issue: "I set it in Cloud Run environment variables"
- **Problem:** Vite requires environment variables at BUILD time, not runtime
- **Solution:** You must pass it as a build argument during Docker build

### Issue: "I don't know my Google Apps Script URL"
- **Solution:** Follow Option 3 above to find it

### Issue: "The URL ends with /dev instead of /exec"
- **Problem:** `/dev` is the development URL, not the deployed one
- **Solution:** Use the deployment URL that ends with `/exec`

## Quick Test

Test your Google Apps Script URL directly:

```bash
curl "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

Should return: `{"success":true,"data":[]}` (or with RSVP data)

If you get an error, check:
- The script is deployed (not just saved)
- Deployment settings: "Who has access: Anyone"
- The URL ends with `/exec`

