# Google Cloud Run Deployment Guide

This guide walks you through deploying the Thanksgiving invitation app to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account**
   - Create a Google Cloud account at [cloud.google.com](https://cloud.google.com)
   - Enable billing (Cloud Run has a free tier)

2. **Install Required Tools**
   - [Google Cloud SDK (gcloud CLI)](https://cloud.google.com/sdk/docs/install)
   - [Docker Desktop](https://docs.docker.com/get-docker/) (optional - only needed for local testing; Cloud Build can build images without local Docker)

3. **Google Cloud Project**
   - Create a new project in [Google Cloud Console](https://console.cloud.google.com)
   - Note your Project ID (you'll need it for deployment)

4. **Google Apps Script Endpoint**
   - Your RSVP API should already be deployed (see [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md))
   - Note the Web App URL (e.g., `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`)
   - This URL will be used by the CORS proxy service

## Quick Start

### Option 1: Deploy Using Cloud Build (No Local Docker Required) - RECOMMENDED

This method uses Google Cloud Build to build both the CORS proxy and main app Docker images. The proxy is deployed first, then its URL is used to build the main app.

```bash
# Submit build to Cloud Build (deploys both proxy and main app)
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_PROXY_SERVICE_NAME=rsvp-proxy,_REGION=us-central1,_APPS_SCRIPT_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

**What this does:**
1. Builds and deploys the CORS proxy service (`rsvp-proxy`)
2. Gets the proxy service URL automatically
3. Builds the main React app with the proxy URL embedded
4. Deploys the main app to Cloud Run

**Note**: The proxy service URL is automatically determined after deployment and used to build the main app. No manual URL configuration needed.

### Option 2: Manual Deployment with CORS Proxy (Requires Local Docker)

For manual deployment, you need to deploy the proxy service first, then the main app. See [CORS Proxy Setup Guide](./CORS_PROXY_SETUP.md) for detailed instructions.

**Quick manual deployment:**

1. **Deploy proxy service:**
   ```bash
   cd proxy
   docker build --build-arg APPS_SCRIPT_URL="YOUR_APPS_SCRIPT_URL" -t gcr.io/YOUR_PROJECT_ID/rsvp-proxy .
   docker push gcr.io/YOUR_PROJECT_ID/rsvp-proxy
   gcloud run deploy rsvp-proxy \
     --image gcr.io/YOUR_PROJECT_ID/rsvp-proxy \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars APPS_SCRIPT_URL="YOUR_APPS_SCRIPT_URL"
   ```

2. **Get proxy URL:**
   ```bash
   PROXY_URL=$(gcloud run services describe rsvp-proxy --region us-central1 --format='value(status.url)')
   echo "Proxy URL: $PROXY_URL/api/rsvp"
   ```

3. **Deploy main app:**
   ```bash
   docker build --build-arg VITE_RSVP_API_URL="$PROXY_URL/api/rsvp" -t gcr.io/YOUR_PROJECT_ID/thanksgiving-app .
   docker push gcr.io/YOUR_PROJECT_ID/thanksgiving-app
   gcloud run deploy thanksgiving-app \
     --image gcr.io/YOUR_PROJECT_ID/thanksgiving-app \
     --region us-central1 \
     --allow-unauthenticated
   ```

**Note**: If you don't have Docker installed, use Option 1 (Cloud Build) instead.

### Option 3: Enable Required APIs

Before deploying, enable the required Google Cloud APIs:

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## Architecture Overview

The deployment consists of two Cloud Run services:

1. **CORS Proxy Service** (`rsvp-proxy`):
   - Handles CORS headers
   - Forwards requests to Google Apps Script
   - Lightweight Node.js/Express service

2. **Main App Service** (`thanksgiving-app`):
   - React frontend application
   - Serves static files via nginx
   - Makes API calls to the proxy service

**Request Flow**: Browser → Main App → CORS Proxy → Google Apps Script → Google Sheets

## Environment Variables

### Main App Build-Time Variables

Vite requires environment variables at build time. The main app Dockerfile accepts `VITE_RSVP_API_URL` as a build argument:

```bash
docker build --build-arg VITE_RSVP_API_URL="https://rsvp-proxy-xxx.run.app/api/rsvp" -t gcr.io/YOUR_PROJECT_ID/thanksgiving-app .
```

**Important**: `VITE_RSVP_API_URL` must point to the CORS proxy service URL (not the Apps Script URL directly).

### Proxy Service Environment Variables

The proxy service requires:
- `APPS_SCRIPT_URL`: Google Apps Script Web App URL (set during deployment)
- `PORT`: Server port (default: 8080)
- `ALLOWED_ORIGIN`: Optional CORS origin (default: `*`)

### Runtime Variables

**Note**: Setting environment variables at runtime won't work for Vite apps because Vite embeds env vars at build time. You must rebuild the image with the correct build arg.

## Service Configuration

### Main App Service Settings

- **Region**: Choose closest to your users (e.g., `us-central1`, `us-east1`, `europe-west1`)
- **Memory**: `512Mi` (sufficient for static site)
- **CPU**: `1` (or `shared-cpu` for cost savings)
- **Min Instances**: `0` (scale to zero when not in use)
- **Max Instances**: `10` (adjust based on expected traffic)
- **Timeout**: `300s` (5 minutes, default)
- **Concurrency**: `80` (default, requests per instance)

### Proxy Service Settings

- **Memory**: `256Mi` (lightweight service)
- **CPU**: `1`
- **Min Instances**: `0` (scale to zero)
- **Max Instances**: `10`
- **Timeout**: `60s` (Apps Script can be slow)
- **Port**: `8080`

### Update Service Settings

```bash
gcloud run services update thanksgiving-app \
  --region us-central1 \
  --memory 1Gi \
  --cpu 2 \
  --max-instances 20
```

## Custom Domain (Optional)

### Step 1: Verify Domain Ownership

1. Go to [Google Cloud Console](https://console.cloud.google.com) → Cloud Run
2. Select your service → **Manage Custom Domains**
3. Click **Add Mapping**
4. Follow the domain verification steps

### Step 2: Configure DNS

Add the provided CNAME record to your domain's DNS settings.

## Monitoring and Logging

### View Logs

```bash
gcloud run services logs read thanksgiving-app --region us-central1
```

Or view in [Cloud Console](https://console.cloud.google.com/run) → Select service → Logs

### Set Up Alerts

1. Go to [Cloud Monitoring](https://console.cloud.google.com/monitoring)
2. Create alerting policies for:
   - High error rates
   - High latency
   - Service unavailability

## Cost Estimation

Cloud Run pricing (as of 2024):
- **Free Tier**: 2 million requests/month, 400,000 GB-seconds, 200,000 vCPU-seconds
- **After Free Tier**:
  - $0.40 per million requests
  - $0.0000025 per GB-second
  - $0.0000100 per vCPU-second

For a small event app:
- **Estimated Monthly Cost**: $0-5 (likely free tier)
- **Traffic**: ~1,000-10,000 requests/month
- **Compute**: Minimal (static site, low CPU usage)

## Troubleshooting

### Build Fails

**Error**: `Cannot find module`
- **Solution**: Ensure `package.json` and `package-lock.json` are in the repository

**Error**: `Build argument not found`
- **Solution**: The build arg is optional. If not provided, set env var in Cloud Run (but remember it won't work for Vite - rebuild with build arg)

### Deployment Fails

**Error**: `Permission denied`
- **Solution**: Run `gcloud auth login` and ensure you have Cloud Run Admin role

**Error**: `Image not found`
- **Solution**: Ensure you've pushed the image to Container Registry first

### App Not Working

**Issue**: API calls failing
- **Check**: Verify `VITE_RSVP_API_URL` points to the CORS proxy (not Apps Script directly)
- **Check**: Verify proxy service is deployed and accessible
- **Check**: Verify proxy can reach Apps Script (check proxy logs)
- **Check**: View browser console for errors
- **Check**: Test proxy directly: `curl https://rsvp-proxy-xxx.run.app/api/rsvp`

**Issue**: 404 errors on routes
- **Check**: nginx.conf is correctly configured for SPA routing
- **Check**: All routes should serve `index.html`

**Issue**: Images not loading
- **Check**: Verify images are in `public/Images/` directory
- **Check**: Check nginx logs for 404 errors

### View Service Details

```bash
gcloud run services describe thanksgiving-app --region us-central1
```

### View Service Logs

```bash
gcloud run services logs read thanksgiving-app --region us-central1 --limit 50
```

## CI/CD with Cloud Build (Optional)

### Set Up Cloud Build Trigger

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click **Create Trigger**
3. Connect your repository (GitHub, GitLab, etc.)
4. Set configuration:
   - **Type**: Cloud Build configuration file
   - **Location**: `cloudbuild.yaml`
5. Set substitution variables:
   - `_SERVICE_NAME`: `thanksgiving-app`
   - `_PROXY_SERVICE_NAME`: `rsvp-proxy`
   - `_REGION`: `us-central1`
   - `_APPS_SCRIPT_URL`: Your Google Apps Script URL
6. Save and test

### Manual Cloud Build

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_PROXY_SERVICE_NAME=rsvp-proxy,_REGION=us-central1,_APPS_SCRIPT_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

## Updating the Deployment

### Rebuild and Redeploy

```bash
# Get current proxy URL
PROXY_URL=$(gcloud run services describe rsvp-proxy --region us-central1 --format='value(status.url)')

# Build new image with proxy URL
docker build --build-arg VITE_RSVP_API_URL="$PROXY_URL/api/rsvp" -t gcr.io/YOUR_PROJECT_ID/thanksgiving-app:latest .

# Push new image
docker push gcr.io/YOUR_PROJECT_ID/thanksgiving-app:latest

# Deploy new revision
gcloud run deploy thanksgiving-app \
  --image gcr.io/YOUR_PROJECT_ID/thanksgiving-app:latest \
  --region us-central1
```

### Rollback to Previous Revision

```bash
# List revisions
gcloud run revisions list --service thanksgiving-app --region us-central1

# Rollback to specific revision
gcloud run services update-traffic thanksgiving-app \
  --to-revisions REVISION_NAME=100 \
  --region us-central1
```

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Store sensitive data in [Secret Manager](https://cloud.google.com/secret-manager)
3. **HTTPS**: Cloud Run provides HTTPS by default
4. **CORS**: The proxy service handles CORS automatically - no Apps Script CORS configuration needed
5. **IAM**: Use least-privilege access for service accounts
6. **Proxy Security**: Consider setting `ALLOWED_ORIGIN` to your specific frontend URL instead of `*` for production

## Next Steps

- Set up a custom domain
- Configure monitoring and alerts for both services
- Set up CI/CD pipeline
- Optimize caching headers
- Add CDN (Cloud CDN) for better performance
- Review [CORS Proxy Setup Guide](./CORS_PROXY_SETUP.md) for proxy-specific configuration

## Support

For issues:
1. Check [Cloud Run documentation](https://cloud.google.com/run/docs)
2. View service logs in Cloud Console
3. Check [Cloud Run status](https://status.cloud.google.com/)

