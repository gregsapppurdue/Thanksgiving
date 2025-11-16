# Troubleshooting Google Cloud Build Errors

## Common Error: "step exited with non-zero status: 2"

This error means the Docker build step failed. Here's how to diagnose and fix it.

## Step 1: View Detailed Build Logs

The error message doesn't show the full details. Get more information:

```bash
# List recent builds
gcloud builds list --limit=5

# View detailed logs for the failed build
gcloud builds log BUILD_ID

# Or view in the console
# Go to: https://console.cloud.google.com/cloud-build/builds
# Click on the failed build to see full logs
```

## Common Causes and Fixes

### Issue 1: Missing Files in Build Context

**Symptoms**: `COPY failed: file not found` or `package.json not found`

**Fix**: Ensure all required files are in the repository and not in `.dockerignore`

```bash
# Check what files are being ignored
cat .dockerignore

# Verify required files exist
ls -la package.json
ls -la Dockerfile
ls -la nginx.conf
```

**Solution**: Remove unnecessary entries from `.dockerignore` or ensure files are committed to git.

### Issue 2: Build Argument Not Set

**Symptoms**: Build succeeds but environment variable is empty

**Fix**: Ensure substitution variables are set in Cloud Build trigger or command:

```bash
# Check your trigger settings
gcloud builds triggers describe TRIGGER_NAME

# Or set them explicitly in the command
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_REGION=us-central1,_VITE_RSVP_API_URL="YOUR_URL"
```

### Issue 3: Dockerfile Syntax Error

**Symptoms**: `syntax error` or `invalid instruction`

**Fix**: Validate Dockerfile locally (if you have Docker):

```bash
# Test build locally
docker build -t test-build .

# Or use hadolint (Dockerfile linter)
# https://github.com/hadolint/hadolint
```

**Common syntax issues**:
- Missing `FROM` statement
- Incorrect `COPY` paths
- Invalid `RUN` commands
- Missing `WORKDIR`

### Issue 4: npm Install Fails

**Symptoms**: `npm ERR!` or `package-lock.json` issues

**Fix**: 
1. Ensure `package-lock.json` is committed
2. Check for version conflicts in `package.json`
3. Try using `npm ci` instead of `npm install` (already in Dockerfile)

```bash
# Regenerate package-lock.json
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

### Issue 5: Build Timeout

**Symptoms**: Build fails after 20 minutes

**Fix**: Increase timeout in `cloudbuild.yaml`:

```yaml
timeout: '3600s'  # 1 hour instead of 20 minutes
```

### Issue 6: Missing Dependencies

**Symptoms**: `Cannot find module` errors

**Fix**: Ensure all dependencies are in `package.json`:

```bash
# Check for missing dependencies
npm install

# Verify all imports have corresponding packages
grep -r "import.*from" src/ | grep -v "node_modules"
```

## Step 2: Test Build Locally (If Docker Available)

If you have Docker installed, test the build locally first:

```bash
# Build with the same arguments Cloud Build uses
docker build \
  --build-arg VITE_RSVP_API_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec" \
  -t thanksgiving-app .

# If it works locally, the issue is likely with Cloud Build configuration
```

## Step 3: Check Cloud Build Permissions

Ensure Cloud Build has necessary permissions:

```bash
# Grant Cloud Build necessary roles
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

## Step 4: Simplify the Build

If the build is still failing, try a simplified version:

**Create `Dockerfile.simple` for testing:**

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_RSVP_API_URL
ENV VITE_RSVP_API_URL=$VITE_RSVP_API_URL
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

## Step 5: Check Build Logs in Console

1. Go to [Cloud Build History](https://console.cloud.google.com/cloud-build/builds)
2. Click on the failed build
3. Expand the failed step
4. Look for specific error messages
5. Common error patterns:
   - `COPY failed: stat /var/lib/docker/... no such file or directory` → File missing
   - `npm ERR!` → Dependency issue
   - `syntax error` → Dockerfile issue
   - `permission denied` → Permission issue

## Quick Fixes

### Fix 1: Rebuild with Verbose Logging

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_REGION=us-central1,_VITE_RSVP_API_URL="YOUR_URL" \
  --verbosity=debug
```

### Fix 2: Use Cloud Build's Built-in Docker

Sometimes the issue is with the Docker builder. Try using a different approach:

```yaml
# In cloudbuild.yaml, try using the newer docker builder
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '--build-arg', 'VITE_RSVP_API_URL=${_VITE_RSVP_API_URL}', '-t', 'gcr.io/$PROJECT_ID/${_SERVICE_NAME}:latest', '.']
```

### Fix 3: Check File Encoding

Ensure all files use UTF-8 encoding, especially:
- `package.json`
- `Dockerfile`
- `nginx.conf`

## Getting More Help

If none of these work:

1. **Copy the full error message** from Cloud Build logs
2. **Check the specific step** that failed (step 0 = Docker build)
3. **Verify file structure** matches what Dockerfile expects
4. **Test with minimal Dockerfile** to isolate the issue

## Example: Complete Debugging Workflow

```bash
# 1. Check what files are in the repo
git ls-files | grep -E "(Dockerfile|package.json|nginx.conf)"

# 2. Verify Dockerfile syntax
docker build --dry-run .  # If you have Docker

# 3. Test build with minimal config
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_REGION=us-central1,_VITE_RSVP_API_URL="test" \
  --verbosity=debug

# 4. Check build logs
gcloud builds list --limit=1
gcloud builds log BUILD_ID
```

## Prevention

To avoid build errors:

1. **Test locally first** (if Docker available)
2. **Commit all required files** (package.json, package-lock.json, etc.)
3. **Keep .dockerignore minimal** (only exclude what's truly unnecessary)
4. **Set substitution variables** in trigger configuration
5. **Monitor build logs** regularly

