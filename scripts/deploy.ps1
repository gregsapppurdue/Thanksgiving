# PowerShell deployment script for Google Cloud Run
# Usage: .\scripts\deploy.ps1 -ProjectId "your-project-id" -Region "us-central1" -ServiceName "thanksgiving-app" -RsvpApiUrl "https://..."

param(
    [string]$ProjectId = "your-project-id",
    [string]$Region = "us-central1",
    [string]$ServiceName = "thanksgiving-app",
    [string]$RsvpApiUrl = ""
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "Starting deployment to Google Cloud Run..."

# Check if gcloud is installed
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-ColorOutput Red "Error: gcloud CLI is not installed."
    Write-Output "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-ColorOutput Red "Error: Docker is not installed."
    Write-Output "Please install it from: https://docs.docker.com/get-docker/"
    exit 1
}

# Check if RSVP_API_URL is provided
if ([string]::IsNullOrEmpty($RsvpApiUrl)) {
    Write-ColorOutput Yellow "Warning: VITE_RSVP_API_URL not provided."
    Write-Output "You can set it later in Cloud Run console or via gcloud CLI."
    $response = Read-Host "Continue without API URL? (y/n)"
    if ($response -ne "y" -and $response -ne "Y") {
        exit 1
    }
}

$ImageName = "gcr.io/$ProjectId/$ServiceName"

# Set the project
Write-ColorOutput Green "Setting GCP project to $ProjectId..."
gcloud config set project $ProjectId

# Enable required APIs
Write-ColorOutput Green "Enabling required Google Cloud APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build Docker image
Write-ColorOutput Green "Building Docker image..."
if ([string]::IsNullOrEmpty($RsvpApiUrl)) {
    docker build -t $ImageName .
} else {
    docker build --build-arg VITE_RSVP_API_URL="$RsvpApiUrl" -t $ImageName .
}

# Push to Container Registry
Write-ColorOutput Green "Pushing image to Container Registry..."
docker push $ImageName

# Deploy to Cloud Run
Write-ColorOutput Green "Deploying to Cloud Run..."
$DeployArgs = @(
    "run", "deploy", $ServiceName,
    "--image", $ImageName,
    "--platform", "managed",
    "--region", $Region,
    "--allow-unauthenticated",
    "--memory", "512Mi",
    "--cpu", "1",
    "--min-instances", "0",
    "--max-instances", "10",
    "--timeout", "300",
    "--port", "8080"
)

# Add environment variable if provided
if (-not [string]::IsNullOrEmpty($RsvpApiUrl)) {
    $DeployArgs += "--set-env-vars"
    $DeployArgs += "VITE_RSVP_API_URL=$RsvpApiUrl"
}

& gcloud $DeployArgs

# Get service URL
$ServiceUrl = gcloud run services describe $ServiceName --region $Region --format 'value(status.url)'

Write-ColorOutput Green "Deployment complete!"
Write-ColorOutput Green "Service URL: $ServiceUrl"

if ([string]::IsNullOrEmpty($RsvpApiUrl)) {
    Write-ColorOutput Yellow "Remember to set VITE_RSVP_API_URL in Cloud Run console:"
    Write-Output "  gcloud run services update $ServiceName --region $Region --set-env-vars VITE_RSVP_API_URL=YOUR_URL"
}

