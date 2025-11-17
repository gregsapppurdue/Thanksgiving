# Deploy to Google Cloud Run - Step-by-Step Instructions

This guide walks you through deploying both the CORS proxy and main React app to Google Cloud Run using Cloud Build.

## Prerequisites

1. **Google Cloud Account**
   - Create an account at [cloud.google.com](https://cloud.google.com)
   - Enable billing (Cloud Run has a generous free tier)

2. **Google Cloud SDK (gcloud CLI)**
   - Install from: [https://cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
   - Verify installation: `gcloud --version`

3. **Google Cloud Project**
   - Create a new project in [Google Cloud Console](https://console.cloud.google.com)
   - Note your **Project ID** (you'll need it)

4. **Google Apps Script URL**
   - Your RSVP API should already be deployed (see [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md))
   - Have the Web App URL ready: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`

## Step 1: Authenticate with Google Cloud

```bash
# Login to your Google account
gcloud auth login

# Set your project (replace YOUR_PROJECT_ID with your actual project ID)
gcloud config set project YOUR_PROJECT_ID

# Verify the project is set
gcloud config get-value project
```

## Step 2: Enable Required APIs

Enable the necessary Google Cloud APIs:

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

**Note**: This may take 1-2 minutes. Wait for confirmation messages.

## Step 3: Navigate to Project Directory

```bash
cd "C:\Users\gsapp\OneDrive\Desktop\DevOps Repo\Thanksgiving Dinner Invite\Thanksgiving"
```

Or navigate to wherever your project is located.

## Step 4: Run Cloud Build Deployment

Run the Cloud Build command with your specific values:

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_PROXY_SERVICE_NAME=rsvp-proxy,_REGION=us-central1,_APPS_SCRIPT_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

**Replace the following:**
- `YOUR_SCRIPT_ID` - Your actual Google Apps Script Web App ID
- `us-central1` - Change to your preferred region if different (e.g., `us-east1`, `europe-west1`)

**Example with actual values:**
```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_PROXY_SERVICE_NAME=rsvp-proxy,_REGION=us-central1,_APPS_SCRIPT_URL="https://script.google.com/macros/s/AKfycbxToc0UHoqQCg6I4ycLiLQNimKaIoqp3tdgMAvXcwva3xI1Tp86z1K7j5BP-_PHq6G8/exec"
```

## What Happens During Deployment

The Cloud Build process will:

1. **Build Proxy Service** (2-3 minutes)
   - Builds Docker image for the CORS proxy
   - Pushes to Container Registry

2. **Deploy Proxy Service** (1-2 minutes)
   - Deploys `rsvp-proxy` to Cloud Run
   - Sets environment variables

3. **Get Proxy URL** (30 seconds)
   - Waits for proxy service to be available
   - Retrieves the service URL
   - Retries up to 10 times if needed

4. **Build Main App** (3-5 minutes)
   - Builds React app with proxy URL embedded
   - Pushes to Container Registry

5. **Deploy Main App** (1-2 minutes)
   - Deploys `thanksgiving-app` to Cloud Run

**Total time**: Approximately 8-12 minutes

## Step 5: Get Your Service URLs

After deployment completes, get your service URLs:

```bash
# Get main app URL
gcloud run services describe thanksgiving-app --region us-central1 --format 'value(status.url)'

# Get proxy service URL
gcloud run services describe rsvp-proxy --region us-central1 --format 'value(status.url)'
```

Or view in the [Cloud Run Console](https://console.cloud.google.com/run):
- Go to Cloud Run → Services
- Click on `thanksgiving-app` or `rsvp-proxy` to see the URL

## Step 6: Verify Deployment

### Test the Proxy Service

```bash
# Test proxy health endpoint
curl https://rsvp-proxy-xxx-uc.a.run.app/health

# Test proxy API endpoint (should return RSVP data)
curl https://rsvp-proxy-xxx-uc.a.run.app/api/rsvp
```

### Test the Main App

1. Open the main app URL in your browser
2. Navigate to the RSVP section
3. Try submitting an RSVP
4. Check that it appears in the "Who's Coming" list

### Check Logs

```bash
# View proxy service logs
gcloud run services logs read rsvp-proxy --region us-central1 --limit 50

# View main app logs
gcloud run services logs read thanksgiving-app --region us-central1 --limit 50
```

## Troubleshooting

### Build Fails with "Permission Denied"

```bash
# Ensure you're authenticated
gcloud auth login

# Check your project
gcloud config get-value project

# Verify you have Cloud Build and Cloud Run permissions
gcloud projects get-iam-policy YOUR_PROJECT_ID
```

### Proxy URL Never Resolves

If you see "ERROR: Proxy URL never resolved":
- Check that the proxy service deployed successfully
- View proxy logs: `gcloud run services logs read rsvp-proxy --region us-central1`
- Try deploying the proxy manually first

### Apps Script Connection Fails

If RSVPs aren't saving:
- Verify `APPS_SCRIPT_URL` is correct in the substitution variables
- Test Apps Script URL directly: `curl "YOUR_APPS_SCRIPT_URL"`
- Check proxy logs for connection errors

### Service Not Accessible

```bash
# Check service status
gcloud run services describe thanksgiving-app --region us-central1

# Verify service is deployed
gcloud run services list --region us-central1
```

## Updating the Deployment

To update after making code changes:

```bash
# Simply run the same command again
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_PROXY_SERVICE_NAME=rsvp-proxy,_REGION=us-central1,_APPS_SCRIPT_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

Cloud Build will:
- Build new images
- Deploy new revisions
- Traffic automatically routes to the new revision

## Setting Up Automatic Deployments (CI/CD)

### Option 1: Cloud Build Trigger (Recommended)

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click **Create Trigger**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `deploy-thanksgiving-app`
   - **Event**: Push to branch
   - **Branch**: `main` (or your default branch)
   - **Configuration**: Cloud Build configuration file
   - **Location**: `cloudbuild.yaml`
5. Set substitution variables:
   - `_SERVICE_NAME`: `thanksgiving-app`
   - `_PROXY_SERVICE_NAME`: `rsvp-proxy`
   - `_REGION`: `us-central1`
   - `_APPS_SCRIPT_URL`: Your Apps Script URL
6. Save

Now every push to `main` will automatically deploy!

### Option 2: Manual Trigger via Console

1. Go to [Cloud Build History](https://console.cloud.google.com/cloud-build/builds)
2. Click **Run Trigger**
3. Select your trigger
4. Click **Run**

## Cost Estimation

**Free Tier** (per month):
- 2 million requests
- 400,000 GB-seconds
- 200,000 vCPU-seconds

**For this app** (typical usage):
- **Estimated cost**: $0-5/month (likely free tier)
- **Traffic**: ~1,000-10,000 requests/month
- **Compute**: Minimal (both services scale to zero)

## Quick Reference Commands

```bash
# Deploy everything
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_PROXY_SERVICE_NAME=rsvp-proxy,_REGION=us-central1,_APPS_SCRIPT_URL="YOUR_URL"

# View build history
gcloud builds list

# View service URLs
gcloud run services list --region us-central1

# View logs
gcloud run services logs read SERVICE_NAME --region us-central1

# Delete services (if needed)
gcloud run services delete thanksgiving-app --region us-central1
gcloud run services delete rsvp-proxy --region us-central1
```

## Next Steps

- Set up a custom domain (see [Cloud Run Deployment Guide](./CLOUD_RUN_DEPLOYMENT.md))
- Configure monitoring and alerts
- Set up Cloud Build triggers for automatic deployment
- Review [CORS Proxy Setup Guide](./CORS_PROXY_SETUP.md) for proxy-specific details

## Support

If you encounter issues:
1. Check the build logs in [Cloud Build History](https://console.cloud.google.com/cloud-build/builds)
2. Check service logs: `gcloud run services logs read SERVICE_NAME --region REGION`
3. Review [Troubleshooting Guide](./TROUBLESHOOTING_CLOUD_BUILD.md)

