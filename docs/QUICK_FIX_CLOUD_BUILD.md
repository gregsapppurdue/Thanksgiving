# Quick Fix: Cloud Build Docker Error

## Immediate Steps to Diagnose

### Step 1: Get the Build ID and View Logs

```bash
# List recent builds
gcloud builds list --limit=5

# View detailed logs (replace BUILD_ID with actual ID)
gcloud builds log BUILD_ID

# Or view in console
# https://console.cloud.google.com/cloud-build/builds
```

### Step 2: Common Issues and Quick Fixes

#### Issue: Missing package-lock.json

**Check:**
```bash
git ls-files | grep package-lock.json
```

**Fix:** If missing, regenerate and commit:
```bash
rm -f package-lock.json
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

#### Issue: Build argument not set

**Check your trigger substitution variables:**
- Go to Cloud Build Triggers
- Click your trigger → Edit
- Verify `_VITE_RSVP_API_URL` is set

**Fix:** Set it manually in the command:
```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_REGION=us-central1,_VITE_RSVP_API_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

#### Issue: Files missing in build context

**Check:** Ensure these files are committed:
- `package.json`
- `package-lock.json`
- `Dockerfile`
- `nginx.conf`
- `tsconfig.json`
- `tailwind.config.js`
- `postcss.config.js`
- `src/` directory
- `public/` directory

**Fix:**
```bash
git add .
git commit -m "Ensure all build files are committed"
git push
```

#### Issue: npm ci fails

**Fix:** Try using npm install instead (temporary fix):

Edit `Dockerfile` line 11:
```dockerfile
RUN npm install  # instead of npm ci
```

Or ensure package-lock.json is up to date:
```bash
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

### Step 3: Test with Minimal Build

Create a test `Dockerfile.test`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_RSVP_API_URL
ENV VITE_RSVP_API_URL=$VITE_RSVP_API_URL
RUN npm run build
```

Test it:
```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_REGION=us-central1,_VITE_RSVP_API_URL="test"
```

## Most Likely Causes

1. **Missing package-lock.json** (most common)
2. **Build argument not set** in trigger
3. **Files not committed** to git
4. **npm ci fails** due to lock file mismatch

## Quick Diagnostic Command

Run this to check your repository:

```bash
# Check if all required files exist
echo "Checking files..."
test -f package.json && echo "✓ package.json" || echo "✗ package.json MISSING"
test -f package-lock.json && echo "✓ package-lock.json" || echo "✗ package-lock.json MISSING"
test -f Dockerfile && echo "✓ Dockerfile" || echo "✗ Dockerfile MISSING"
test -f nginx.conf && echo "✓ nginx.conf" || echo "✗ nginx.conf MISSING"
test -d src && echo "✓ src/" || echo "✗ src/ MISSING"
test -d public && echo "✓ public/" || echo "✗ public/ MISSING"
```

## Still Failing?

1. **Copy the full error** from Cloud Build logs
2. **Check which step failed** (step 0 = Docker build)
3. **Look for specific error messages** like:
   - "package.json not found"
   - "npm ERR!"
   - "COPY failed"
   - "syntax error"

See [TROUBLESHOOTING_CLOUD_BUILD.md](./TROUBLESHOOTING_CLOUD_BUILD.md) for detailed troubleshooting.

