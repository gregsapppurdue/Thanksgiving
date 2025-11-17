# Troubleshooting: RSVP API Endpoint Not Configured

## Error Message

```
RSVP API endpoint is not configured. Your RSVP cannot be saved. Please contact the administrator.
```

This error means `VITE_RSVP_API_URL` is not set or is empty.

## Quick Diagnosis

First, determine where you're running the app:

1. **Local Development** (localhost) - See [Local Development Fix](#local-development-fix)
2. **Cloud Run Deployment** - See [Cloud Run Deployment Fix](#cloud-run-deployment-fix)

## Local Development Fix

### Step 1: Check if `.env` File Exists

```bash
# In your project root directory
ls .env
# or on Windows
dir .env
```

If the file doesn't exist, create it.

### Step 2: Create/Update `.env` File

Create a `.env` file in the project root with:

```env
VITE_RSVP_API_URL=https://your-proxy-service.run.app/api/rsvp
```

**If you're using the proxy service:**
```env
VITE_RSVP_API_URL=https://rsvp-proxy-xxx-uc.a.run.app/api/rsvp
```

**If you're testing directly with Apps Script (not recommended):**
```env
VITE_RSVP_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Step 3: Verify the File Location

The `.env` file must be in the **project root** (same directory as `package.json`):

```
Thanksgiving/
├── .env              ← Must be here
├── package.json
├── src/
└── ...
```

### Step 4: Restart Development Server

**Important**: Vite only reads `.env` files when the dev server starts. You must restart:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### Step 5: Verify in Browser Console

1. Open your app in the browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Look for: `RSVP API Endpoint: https://...`

If you see `RSVP API Endpoint: NOT CONFIGURED`, the variable isn't being read.

### Step 6: Check File Format

Make sure `.env` file:
- Has no spaces around the `=` sign
- Has no quotes around the URL (unless the URL itself contains special characters)
- Uses forward slashes `/` (not backslashes `\`)
- Has no trailing spaces

**Correct:**
```env
VITE_RSVP_API_URL=https://rsvp-proxy-xxx.run.app/api/rsvp
```

**Incorrect:**
```env
VITE_RSVP_API_URL = "https://..."  ← Spaces and quotes
VITE_RSVP_API_URL=https://...      ← Trailing space
```

## Cloud Run Deployment Fix

If you're seeing this error in your deployed Cloud Run service, the build argument wasn't passed correctly.

### Step 1: Check Cloud Build Logs

1. Go to [Cloud Build History](https://console.cloud.google.com/cloud-build/builds)
2. Find your most recent build
3. Click on it to view logs
4. Look for the "build-main-app" step
5. Check if you see: `Using Proxy API URL: https://...`

**If you see an empty URL or error**, the proxy URL wasn't retrieved correctly.

### Step 2: Verify Proxy Service Was Deployed

```bash
# Check if proxy service exists
gcloud run services list --region us-central1

# Get proxy URL manually
gcloud run services describe rsvp-proxy --region us-central1 --format 'value(status.url)'
```

If the proxy service doesn't exist, deploy it first.

### Step 3: Check Build Arguments

In the Cloud Build logs, look for the build step and verify:

```
docker build --build-arg VITE_RSVP_API_URL="https://..."
```

If the build arg is missing or empty, the deployment failed.

### Step 4: Verify Proxy URL Retrieval

In Cloud Build logs, find the "get-proxy-url" step. You should see:

```
Waiting for proxy service URL...
✓ Proxy URL: https://rsvp-proxy-xxx.run.app
```

If you see "ERROR: Proxy URL never resolved", the proxy service deployment failed or took too long.

### Step 5: Redeploy with Correct Configuration

If the build failed, redeploy:

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_PROXY_SERVICE_NAME=rsvp-proxy,_REGION=us-central1,_APPS_SCRIPT_URL="YOUR_APPS_SCRIPT_URL"
```

**Important**: Make sure `_APPS_SCRIPT_URL` is set correctly.

### Step 6: Check Built Application

If the build succeeded but the app still shows the error:

1. **Verify the build included the variable:**
   - In Cloud Build logs, check the build step output
   - Look for: `Using Proxy API URL: https://...`

2. **Check the deployed service:**
   ```bash
   # Get service URL
   gcloud run services describe thanksgiving-app --region us-central1 --format 'value(status.url)'
   
   # Open in browser and check console
   # Should see: RSVP API Endpoint: https://...
   ```

3. **If variable is still missing**, the build step didn't receive the proxy URL correctly.

## Common Issues and Solutions

### Issue 1: `.env` File Not in Root

**Symptom**: Variable not found even though file exists

**Solution**: Move `.env` to project root (same level as `package.json`)

### Issue 2: Dev Server Not Restarted

**Symptom**: Changed `.env` but still seeing old value

**Solution**: Stop and restart `npm run dev`

### Issue 3: Proxy URL Not Retrieved in Cloud Build

**Symptom**: Build succeeds but app shows "NOT CONFIGURED"

**Solution**: 
1. Check proxy service is deployed: `gcloud run services list`
2. Manually get proxy URL and rebuild:
   ```bash
   PROXY_URL=$(gcloud run services describe rsvp-proxy --region us-central1 --format='value(status.url)')
   docker build --build-arg VITE_RSVP_API_URL="$PROXY_URL/api/rsvp" -t gcr.io/PROJECT_ID/thanksgiving-app .
   ```

### Issue 4: Build Arg Not Passed

**Symptom**: Cloud Build completes but variable is empty

**Solution**: Check Cloud Build substitution variables are set correctly:
- `_SERVICE_NAME`
- `_PROXY_SERVICE_NAME`
- `_REGION`
- `_APPS_SCRIPT_URL`

### Issue 5: Proxy Service Not Deployed

**Symptom**: "get-proxy-url" step fails

**Solution**: Deploy proxy service first:
```bash
cd proxy
docker build --build-arg APPS_SCRIPT_URL="YOUR_APPS_SCRIPT_URL" -t gcr.io/PROJECT_ID/rsvp-proxy .
docker push gcr.io/PROJECT_ID/rsvp-proxy
gcloud run deploy rsvp-proxy \
  --image gcr.io/PROJECT_ID/rsvp-proxy \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars APPS_SCRIPT_URL="YOUR_APPS_SCRIPT_URL"
```

## Verification Steps

### For Local Development

1. ✅ `.env` file exists in project root
2. ✅ `.env` contains `VITE_RSVP_API_URL=https://...`
3. ✅ Dev server was restarted after creating/updating `.env`
4. ✅ Browser console shows: `RSVP API Endpoint: https://...` (not "NOT CONFIGURED")

### For Cloud Run

1. ✅ Proxy service is deployed and accessible
2. ✅ Cloud Build logs show proxy URL was retrieved
3. ✅ Build step shows: `Using Proxy API URL: https://...`
4. ✅ Deployed app console shows: `RSVP API Endpoint: https://...`

## Quick Test

Test if the endpoint is accessible:

```bash
# For proxy service
curl https://rsvp-proxy-xxx.run.app/api/rsvp

# For Apps Script (if testing directly)
curl https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

Both should return JSON (even if empty array `{"success":true,"data":[]}`).

## Still Not Working?

1. **Check browser console** for the exact error message
2. **Check Cloud Build logs** for build errors
3. **Check Cloud Run logs** for runtime errors:
   ```bash
   gcloud run services logs read thanksgiving-app --region us-central1
   ```
4. **Verify the proxy service is working**:
   ```bash
   curl https://rsvp-proxy-xxx.run.app/health
   ```

## Summary

- **Local**: Create `.env` file with `VITE_RSVP_API_URL` and restart dev server
- **Cloud Run**: Ensure Cloud Build retrieved proxy URL and passed it as build arg
- **Always**: Check browser console to verify the variable is loaded

