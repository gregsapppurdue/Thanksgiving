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

## Quick Start

### Option 1: Deploy Using Cloud Build (No Local Docker Required)

This method uses Google Cloud Build to build the Docker image, so you don't need Docker installed locally.

```bash
# Submit build to Cloud Build
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_REGION=us-central1,_VITE_RSVP_API_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

### Option 2: Automated Deployment Script (Requires Local Docker)

**Windows (PowerShell):**
```powershell
.\scripts\deploy.ps1 -ProjectId "your-project-id" -Region "us-central1" -ServiceName "thanksgiving-app" -RsvpApiUrl "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

**Linux/Mac:**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh your-project-id us-central1 thanksgiving-app "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

**Note**: If you don't have Docker installed, use Option 1 (Cloud Build) instead.

### Option 3: Manual Deployment (Requires Local Docker)

#### Step 1: Authenticate with Google Cloud

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

#### Step 2: Enable Required APIs

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

#### Step 3: Build Docker Image (Requires Docker Desktop)

```bash
# Build with environment variable
docker build --build-arg VITE_RSVP_API_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec" -t gcr.io/YOUR_PROJECT_ID/thanksgiving-app .

# Or build without (set later in Cloud Run)
docker build -t gcr.io/YOUR_PROJECT_ID/thanksgiving-app .
```

#### Step 4: Push to Container Registry

```bash
# Configure Docker to use gcloud as credential helper
gcloud auth configure-docker

# Push the image
docker push gcr.io/YOUR_PROJECT_ID/thanksgiving-app
```

#### Step 5: Deploy to Cloud Run

```bash
gcloud run deploy thanksgiving-app \
  --image gcr.io/YOUR_PROJECT_ID/thanksgiving-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --port 8080 \
  --set-env-vars VITE_RSVP_API_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

#### Step 6: Get Service URL

```bash
gcloud run services describe thanksgiving-app --region us-central1 --format 'value(status.url)'
```

## Environment Variables

### Build-Time Variables

Vite requires environment variables at build time. The Dockerfile accepts `VITE_RSVP_API_URL` as a build argument:

```bash
docker build --build-arg VITE_RSVP_API_URL="YOUR_URL" -t gcr.io/YOUR_PROJECT_ID/thanksgiving-app .
```

### Runtime Variables (Alternative)

If you forgot to set the build arg, you can set it in Cloud Run, but **it won't work** because Vite embeds env vars at build time. You must rebuild the image with the correct build arg.

## Service Configuration

### Recommended Settings

- **Region**: Choose closest to your users (e.g., `us-central1`, `us-east1`, `europe-west1`)
- **Memory**: `512Mi` (sufficient for static site)
- **CPU**: `1` (or `shared-cpu` for cost savings)
- **Min Instances**: `0` (scale to zero when not in use)
- **Max Instances**: `10` (adjust based on expected traffic)
- **Timeout**: `300s` (5 minutes, default)
- **Concurrency**: `80` (default, requests per instance)

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
- **Check**: Verify `VITE_RSVP_API_URL` is set correctly
- **Check**: Ensure Google Apps Script allows CORS from Cloud Run domain
- **Check**: View browser console for errors

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
   - `_REGION`: `us-central1`
   - `_VITE_RSVP_API_URL`: Your Google Apps Script URL
6. Save and test

### Manual Cloud Build

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_REGION=us-central1,_VITE_RSVP_API_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

## Updating the Deployment

### Rebuild and Redeploy

```bash
# Build new image
docker build --build-arg VITE_RSVP_API_URL="YOUR_URL" -t gcr.io/YOUR_PROJECT_ID/thanksgiving-app:latest .

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
4. **CORS**: Ensure Google Apps Script allows requests from your Cloud Run domain
5. **IAM**: Use least-privilege access for service accounts

## Next Steps

- Set up a custom domain
- Configure monitoring and alerts
- Set up CI/CD pipeline
- Optimize caching headers
- Add CDN (Cloud CDN) for better performance

## Support

For issues:
1. Check [Cloud Run documentation](https://cloud.google.com/run/docs)
2. View service logs in Cloud Console
3. Check [Cloud Run status](https://status.cloud.google.com/)

