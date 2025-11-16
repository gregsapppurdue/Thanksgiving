#!/bin/bash

# Deployment script for Google Cloud Run
# Usage: ./scripts/deploy.sh [PROJECT_ID] [REGION] [SERVICE_NAME] [RSVP_API_URL]

set -e

# Configuration
PROJECT_ID=${1:-"your-project-id"}
REGION=${2:-"us-central1"}
SERVICE_NAME=${3:-"thanksgiving-app"}
RSVP_API_URL=${4:-""}
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment to Google Cloud Run...${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed.${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed.${NC}"
    echo "Please install it from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if RSVP_API_URL is provided
if [ -z "$RSVP_API_URL" ]; then
    echo -e "${YELLOW}Warning: VITE_RSVP_API_URL not provided.${NC}"
    echo "You can set it later in Cloud Run console or via gcloud CLI."
    read -p "Continue without API URL? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Set the project
echo -e "${GREEN}Setting GCP project to ${PROJECT_ID}...${NC}"
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo -e "${GREEN}Enabling required Google Cloud APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build Docker image
echo -e "${GREEN}Building Docker image...${NC}"
if [ -z "$RSVP_API_URL" ]; then
    docker build -t ${IMAGE_NAME} .
else
    docker build --build-arg VITE_RSVP_API_URL="${RSVP_API_URL}" -t ${IMAGE_NAME} .
fi

# Push to Container Registry
echo -e "${GREEN}Pushing image to Container Registry...${NC}"
docker push ${IMAGE_NAME}

# Deploy to Cloud Run
echo -e "${GREEN}Deploying to Cloud Run...${NC}"
DEPLOY_CMD="gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --timeout 300 \
    --port 8080"

# Add environment variable if provided
if [ -n "$RSVP_API_URL" ]; then
    DEPLOY_CMD="${DEPLOY_CMD} --set-env-vars VITE_RSVP_API_URL=${RSVP_API_URL}"
fi

eval ${DEPLOY_CMD}

# Get service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}Service URL: ${SERVICE_URL}${NC}"

if [ -z "$RSVP_API_URL" ]; then
    echo -e "${YELLOW}Remember to set VITE_RSVP_API_URL in Cloud Run console:${NC}"
    echo "  gcloud run services update ${SERVICE_NAME} --region ${REGION} --set-env-vars VITE_RSVP_API_URL=YOUR_URL"
fi

