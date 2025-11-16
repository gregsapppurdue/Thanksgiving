Deploy Thanksgiving App to Google Cloud Run
Overview
Deploy the React/Vite single-page application to Google Cloud Run as a containerized service. The app will be built, packaged in a Docker container with nginx, and deployed to Cloud Run for serverless hosting.

Implementation Steps
1. Create Docker Configuration
File: Dockerfile
Multi-stage build: Node.js for building, nginx for serving
Build stage: Install dependencies, run npm run build
Serve stage: Copy dist/ to nginx html directory
Use lightweight nginx:alpine base image
Expose port 8080 (Cloud Run default)
File: .dockerignore
Exclude node_modules, .git, dist, .env files
Optimize build context size
File: nginx.conf
Configure nginx to serve static files
Handle SPA routing (all routes serve index.html)
Set proper MIME types for assets
Configure caching headers for static assets
Listen on port 8080
2. Environment Variable Handling
File: cloudbuild.yaml (optional, for CI/CD)
Build Docker image
Set environment variables during build
Push to Google Container Registry/Artifact Registry
Cloud Run Configuration:
Set VITE_RSVP_API_URL as environment variable in Cloud Run service
Use Cloud Run's environment variable UI or gcloud CLI
Note: Vite env vars must be set at build time, so we'll need a build-time injection strategy
3. Build and Deployment Scripts
File: scripts/deploy.sh (or deploy.ps1 for Windows)
Authenticate with gcloud
Build Docker image
Push to Artifact Registry
Deploy to Cloud Run
Set environment variables
Configure service settings (region, memory, CPU)
File: scripts/build-and-deploy.sh
Local build test
Docker build validation
Deployment workflow
4. Cloud Run Service Configuration
Service Settings:
Region: Choose closest to users (e.g., us-central1)
Memory: 512Mi (sufficient for static site)
CPU: 1 (or shared CPU for cost savings)
Min instances: 0 (scale to zero)
Max instances: 10 (adjust based on traffic)
Timeout: 300s (default)
Concurrency: 80 (default)
Environment Variables:
VITE_RSVP_API_URL: Google Apps Script endpoint URL
Set via Cloud Run console or gcloud CLI
5. Build-Time Environment Variable Injection
Since Vite requires env vars at build time, we need a strategy:

Option A: Build Docker image with build args, inject at build time
Option B: Use a runtime configuration script that replaces placeholders
Option C: Build with default, override via Cloud Run env vars (won't work for Vite)
Recommended: Use build args in Dockerfile, pass via Cloud Build or deployment script
6. Documentation
File: docs/CLOUD_RUN_DEPLOYMENT.md
Prerequisites (gcloud CLI, Docker, Google Cloud project)
Step-by-step deployment instructions
Environment variable setup
Custom domain configuration (optional)
Monitoring and logging setup
Cost estimation
Troubleshooting guide
7. Testing and Validation
Test Docker build locally
Test nginx configuration
Verify SPA routing works
Test environment variable injection
Validate API connectivity from deployed app
Test on Cloud Run before making public
Key Considerations
SPA Routing: nginx must serve index.html for all routes (React Router compatibility)
Environment Variables: Vite requires build-time injection, not runtime
Static Assets: Images in public/Images/ must be properly served
CORS: Google Apps Script endpoint must allow requests from Cloud Run domain
Cost: Cloud Run charges per request and compute time (very low for static sites)
Custom Domain: Optional, can configure later via Cloud Run domain mapping
Files to Create
Dockerfile - Multi-stage Docker build
.dockerignore - Docker build exclusions
nginx.conf - Nginx server configuration
scripts/deploy.sh - Deployment automation script
cloudbuild.yaml - Google Cloud Build configuration (optional)
docs/CLOUD_RUN_DEPLOYMENT.md - Deployment documentation
Files to Modify
package.json - Add deployment scripts (optional)
.gitignore - Ensure .env is ignored (already should be)
Prerequisites
Google Cloud account with billing enabled
gcloud CLI installed and configured
Docker installed locally (for testing)
Google Cloud project created
Artifact Registry or Container Registry enabled