# Cloud Build Trigger Setup Guide

This guide helps you set up Cloud Build triggers for automatic deployments when you push code to your repository.

## Understanding the Error

The error "no branch matching the configured branch pattern could be found" means:
- A Cloud Build trigger was created
- The trigger is configured to watch for specific branch patterns (e.g., `main`, `master`, `.*`)
- Your current branch doesn't match that pattern

## Solution Options

### Option 1: Push to Matching Branch (Recommended)

If your trigger is configured for `main` or `master`:

```bash
# Check your current branch
git branch

# If you're on a different branch, push to main/master
git checkout -b main  # or master
git push origin main
```

### Option 2: Update Trigger Branch Pattern

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click on your trigger
3. Click **Edit**
4. Under **Configuration**, find **Branch** or **Branch/Tag**
5. Update the pattern to match your branch:
   - `.*` - matches all branches
   - `main` - matches only main branch
   - `master` - matches only master branch
   - `feature/.*` - matches all feature branches
6. Click **Save**

### Option 3: Manual Deployment (No Trigger Needed)

You don't need a trigger to deploy! You can deploy manually anytime:

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_REGION=us-central1,_VITE_RSVP_API_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

## Setting Up a New Trigger

### Step 1: Connect Repository

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click **Create Trigger**
3. Select your repository source:
   - **GitHub** - Connect your GitHub account
   - **GitLab** - Connect your GitLab account
   - **Bitbucket** - Connect your Bitbucket account
   - **Cloud Source Repositories** - Use Google's hosted Git
4. Authenticate and select your repository

### Step 2: Configure Trigger

1. **Name**: `thanksgiving-app-deploy` (or any name you prefer)

2. **Event**: Choose when to trigger
   - **Push to a branch** - Deploys on every push
   - **Push to a tag** - Deploys when you tag a release
   - **Pull request** - Deploys on PR creation/update

3. **Source**: 
   - **Repository**: Select your connected repo
   - **Branch**: 
     - `^main$` - Only main branch
     - `^master$` - Only master branch
     - `.*` - All branches (not recommended for production)
     - `^(main|develop)$` - Multiple specific branches

4. **Configuration**:
   - **Type**: Cloud Build configuration file
   - **Location**: `cloudbuild.yaml`

5. **Substitution variables** (Important!):
   Click **Show included and ignored files** → **Substitution variables**:
   ```
   _SERVICE_NAME=thanksgiving-app
   _REGION=us-central1
   _VITE_RSVP_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

6. Click **Create**

### Step 3: Test the Trigger

1. Make a small change to your code
2. Commit and push to the branch that matches your trigger pattern:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main  # or master, depending on your pattern
   ```
3. Go to [Cloud Build History](https://console.cloud.google.com/cloud-build/builds)
4. You should see a new build starting automatically

## Common Branch Patterns

| Pattern | Matches |
|---------|---------|
| `^main$` | Only `main` branch |
| `^master$` | Only `master` branch |
| `^(main\|master)$` | Both `main` and `master` |
| `.*` | All branches (use with caution) |
| `^release/.*` | All branches starting with `release/` |
| `^(main\|develop\|release/.*)$` | Multiple patterns |

## Troubleshooting

### Trigger Not Firing

1. **Check branch name**: Ensure you're pushing to a branch that matches the pattern
2. **Check trigger status**: In Cloud Build Triggers, verify the trigger is enabled
3. **Check build history**: Go to Cloud Build History to see if builds are being triggered
4. **Check repository connection**: Ensure your repository is still connected

### Build Fails After Trigger

1. **Check substitution variables**: Ensure all required variables are set
2. **Check cloudbuild.yaml**: Verify the file exists and is correct
3. **Check permissions**: Ensure Cloud Build has permission to deploy to Cloud Run
4. **View build logs**: Click on the failed build to see error details

### Update Substitution Variables

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click on your trigger → **Edit**
3. Scroll to **Substitution variables**
4. Update values as needed
5. Click **Save**

## Disable/Delete Trigger

If you don't want automatic deployments:

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click on your trigger
3. Click **Disable** (to temporarily disable) or **Delete** (to remove permanently)

## Manual Deployment (Alternative)

If you prefer manual control, you can skip triggers entirely and deploy manually:

```bash
# Deploy whenever you want
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_REGION=us-central1,_VITE_RSVP_API_URL="YOUR_URL"
```

This gives you full control over when deployments happen.

## Best Practices

1. **Use specific branch patterns**: Don't use `.*` for production - use `^main$` or `^master$`
2. **Separate triggers for different environments**: 
   - `main` → production
   - `develop` → staging
3. **Set substitution variables**: Don't hardcode values in cloudbuild.yaml
4. **Test triggers**: Push a small change first to verify the trigger works
5. **Monitor builds**: Check Cloud Build History regularly

