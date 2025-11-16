# Deploy to Cloud Run Without Local Docker

If you don't have Docker installed locally, you can still deploy to Google Cloud Run using Google Cloud Build. This guide shows you how.

## Prerequisites

- Google Cloud account with billing enabled
- [Google Cloud SDK (gcloud CLI)](https://cloud.google.com/sdk/docs/install) installed
- Google Cloud project created

**You do NOT need Docker Desktop installed!**

## Step 1: Authenticate and Set Up

```bash
# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## Step 2: Deploy Using Cloud Build

Cloud Build will build the Docker image in the cloud, so you don't need Docker locally.

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_REGION=us-central1,_VITE_RSVP_API_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

Replace:
- `YOUR_PROJECT_ID` with your actual Google Cloud project ID
- `YOUR_SCRIPT_ID` with your Google Apps Script Web App URL

## Step 3: Verify Deployment

After the build completes, get your service URL:

```bash
gcloud run services describe thanksgiving-app --region us-central1 --format 'value(status.url)'
```

Visit the URL in your browser to see your deployed app!

## Alternative: Deploy Without cloudbuild.yaml

If you prefer, you can also use `gcloud builds submit` directly:

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/thanksgiving-app \
  --substitutions=_VITE_RSVP_API_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"

gcloud run deploy thanksgiving-app \
  --image gcr.io/YOUR_PROJECT_ID/thanksgiving-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --set-env-vars VITE_RSVP_API_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

## Troubleshooting

### Build Fails: "Permission denied"
- Make sure you're authenticated: `gcloud auth login`
- Check you have Cloud Build Editor role: `gcloud projects get-iam-policy YOUR_PROJECT_ID`

### Build Fails: "API not enabled"
- Run: `gcloud services enable cloudbuild.googleapis.com`

### Service URL Not Working
- Check the service is deployed: `gcloud run services list --region us-central1`
- View logs: `gcloud run services logs read thanksgiving-app --region us-central1`

## Next Steps

- Set up a custom domain (see [CLOUD_RUN_DEPLOYMENT.md](./CLOUD_RUN_DEPLOYMENT.md))
- Configure monitoring and alerts
- Set up CI/CD triggers for automatic deployments

