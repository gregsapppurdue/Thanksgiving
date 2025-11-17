# CORS Proxy Setup Guide

## Overview

This guide explains how to set up and deploy the CORS proxy service that enables the React frontend to communicate with Google Apps Script without CORS issues.

## Why a CORS Proxy is Needed

### Google Apps Script CORS Limitations

1. **ContentService Limitations**: Google Apps Script's `ContentService` does not support manual CORS header setting via `setHeader()`. While CORS headers are automatically added when deployed with "Anyone" access, this automatic handling is unreliable and inconsistent.

2. **Preflight Request Failures**: When browsers send OPTIONS preflight requests for cross-origin POST requests with custom headers or non-simple content types, Google Apps Script's `doOptions()` handler often fails to return proper CORS headers, causing the browser to block the actual request.

3. **Inconsistent CORS Behavior**: Even with "Who has access: Anyone" deployment, Google Apps Script may not consistently return CORS headers for all request types, especially for complex scenarios involving custom headers or different HTTP methods.

4. **No Server-Side Control**: The frontend has no control over CORS headers when calling Apps Script directly, making it impossible to ensure proper CORS compliance.

### Why Cloud Run Proxy Solves This

- Cloud Run services have full control over HTTP response headers, allowing proper CORS header configuration
- Server-to-server communication (Cloud Run → Apps Script) bypasses browser CORS restrictions entirely
- The proxy can normalize and validate responses before returning to the client
- Provides a single point of control for API routing and error handling

## Architecture

**Request Flow**: Browser → Cloud Run (React App) → Cloud Run (CORS Proxy) → Google Apps Script → Google Sheets

**Response Flow**: Google Sheets → Google Apps Script → Cloud Run (CORS Proxy) → Cloud Run (React App) → Browser

The React app deployed on Cloud Run makes requests to a separate Cloud Run proxy service, which then makes server-to-server requests to Google Apps Script. This eliminates browser CORS issues since the proxy-to-Apps Script communication is server-to-server.

## Proxy Service Structure

The proxy service is located in the `proxy/` directory:

- `proxy/package.json` - Node.js dependencies (express, cors)
- `proxy/server.js` - Express server with CORS proxy logic
- `proxy/Dockerfile` - Container configuration
- `proxy/.dockerignore` - Build exclusions

## Proxy Implementation Details

### Route Structure

The proxy exposes a single endpoint that forwards all requests:

- **GET `/api/rsvp`** - Forwards to Apps Script `doGet()`
- **POST `/api/rsvp`** - Forwards to Apps Script `doPost()`
- **OPTIONS `/api/rsvp`** - Handles CORS preflight directly (does not forward)

### Request Forwarding

1. **Extract Request Details**: Parse incoming request method, headers, and body
2. **Construct Apps Script URL**: Use environment variable `APPS_SCRIPT_URL` to build the target URL
3. **Forward Request**: Make HTTP request to Apps Script using `fetch()`:
   - For GET: Forward query parameters if any
   - For POST: Forward request body with `text/plain;charset=utf-8` content type (Apps Script requirement)
   - For OPTIONS: Handle locally without forwarding
4. **Preserve Request Body**: Ensure POST body is forwarded exactly as received
5. **Handle Timeouts**: Set appropriate timeout (30 seconds default) for Apps Script requests

### Response Normalization

1. **Status Code Forwarding**: Forward HTTP status code from Apps Script response
2. **Body Parsing**: Parse Apps Script JSON response
3. **Error Normalization**: Convert Apps Script errors to consistent error format:
   - Network errors → 502 Bad Gateway
   - Apps Script errors → Forward error message in standardized format
   - Timeout errors → 504 Gateway Timeout
4. **Response Structure**: Ensure all responses follow `{success: boolean, data?: any, error?: string}` format
5. **Logging**: Log all requests and responses for debugging (without sensitive data)

### CORS Headers

The proxy sets CORS headers on all responses:

- `Access-Control-Allow-Origin: *` (or specific origin if `ALLOWED_ORIGIN` is set)
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`
- `Access-Control-Max-Age: 86400` (24 hours for preflight cache)

For OPTIONS requests, return 200 with only CORS headers (no body).

### Environment Variables

The proxy service requires:

- `APPS_SCRIPT_URL` - Full Google Apps Script Web App URL (e.g., `https://script.google.com/macros/s/.../exec`)
- `PORT` - Server port (default: 8080 for Cloud Run)
- `ALLOWED_ORIGIN` - Optional: Specific origin for CORS (default: `*`)

## Deployment

### Cloud Build Deployment (Automated)

The `cloudbuild.yaml` file automatically builds and deploys both services:

1. **Build Proxy Service**: Builds Docker image with `APPS_SCRIPT_URL` build arg
2. **Deploy Proxy Service**: Deploys to Cloud Run as `rsvp-proxy` service
3. **Get Proxy URL**: Retrieves the deployed proxy service URL
4. **Build Main App**: Builds React app with `VITE_RSVP_API_URL` pointing to proxy
5. **Deploy Main App**: Deploys React app to Cloud Run

**Required Substitution Variables**:
- `_SERVICE_NAME`: Main app service name (e.g., `thanksgiving-app`)
- `_PROXY_SERVICE_NAME`: Proxy service name (e.g., `rsvp-proxy`)
- `_REGION`: Cloud Run region (e.g., `us-central1`)
- `_APPS_SCRIPT_URL`: Google Apps Script Web App URL

**Deploy Command**:
```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_PROXY_SERVICE_NAME=rsvp-proxy,_REGION=us-central1,_APPS_SCRIPT_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

### Manual Deployment

If deploying manually:

1. **Build and deploy proxy**:
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

2. **Get proxy URL**:
   ```bash
   PROXY_URL=$(gcloud run services describe rsvp-proxy --region us-central1 --format='value(status.url)')
   echo "Proxy URL: $PROXY_URL/api/rsvp"
   ```

3. **Build and deploy main app** with proxy URL:
   ```bash
   docker build --build-arg VITE_RSVP_API_URL="$PROXY_URL/api/rsvp" -t gcr.io/YOUR_PROJECT_ID/thanksgiving-app .
   docker push gcr.io/YOUR_PROJECT_ID/thanksgiving-app
   gcloud run deploy thanksgiving-app \
     --image gcr.io/YOUR_PROJECT_ID/thanksgiving-app \
     --region us-central1 \
     --allow-unauthenticated
   ```

## Frontend Changes

The frontend (`src/services/rsvpService.ts`) has been updated to:

1. **Use Proxy Endpoint**: `VITE_RSVP_API_URL` now points to Cloud Run proxy (e.g., `https://rsvp-proxy-xxx.run.app/api/rsvp`)
2. **Standard JSON**: Changed `Content-Type` from `text/plain` to `application/json` (proxy handles conversion)
3. **Simplified Error Handling**: Removed Apps Script-specific workarounds since proxy normalizes errors

## Testing

### Test Proxy Directly

```bash
# Test GET
curl "https://rsvp-proxy-xxx.run.app/api/rsvp"

# Test POST
curl -X POST "https://rsvp-proxy-xxx.run.app/api/rsvp" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","item":"Test Item"}'

# Test OPTIONS (preflight)
curl -X OPTIONS "https://rsvp-proxy-xxx.run.app/api/rsvp" \
  -H "Origin: https://your-app.run.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

### Verify CORS Headers

Check that responses include:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Troubleshooting

### Proxy Not Responding

1. Check Cloud Run service logs:
   ```bash
   gcloud run services logs read rsvp-proxy --region us-central1
   ```

2. Verify environment variables are set:
   ```bash
   gcloud run services describe rsvp-proxy --region us-central1 --format='value(spec.template.spec.containers[0].env)'
   ```

### CORS Errors Still Occurring

1. Verify proxy is deployed and accessible
2. Check that frontend is using proxy URL (not Apps Script URL directly)
3. Verify proxy CORS headers in response (use browser DevTools Network tab)
4. Check that `ALLOWED_ORIGIN` matches your frontend origin if set

### Apps Script Connection Failures

1. Verify `APPS_SCRIPT_URL` is correct in proxy environment variables
2. Test Apps Script URL directly:
   ```bash
   curl "YOUR_APPS_SCRIPT_URL"
   ```
3. Check proxy logs for Apps Script connection errors

## Service Configuration

### Proxy Service Settings

- **Memory**: 256Mi (lighter than main app)
- **CPU**: 1
- **Min Instances**: 0 (scale to zero)
- **Max Instances**: 10
- **Timeout**: 60s (Apps Script can be slow)
- **Port**: 8080

### Main App Settings

- **Memory**: 512Mi
- **CPU**: 1
- **Min Instances**: 0
- **Max Instances**: 10
- **Timeout**: 300s
- **Port**: 8080

## Security Considerations

1. **Public Access**: Both services are deployed with `--allow-unauthenticated` for public access
2. **CORS Origin**: Consider setting `ALLOWED_ORIGIN` to your specific frontend URL instead of `*` for production
3. **Rate Limiting**: Consider adding rate limiting to the proxy service for production use
4. **Input Validation**: The proxy forwards requests as-is; ensure Apps Script validates input

## Cost Considerations

- Proxy service: Minimal cost (lightweight, scales to zero)
- Main app: Standard Cloud Run pricing
- Both services scale independently based on traffic

## Maintenance

- Update `APPS_SCRIPT_URL` if Google Apps Script URL changes
- Monitor proxy logs for Apps Script connection issues
- Update proxy service independently from main app if needed

