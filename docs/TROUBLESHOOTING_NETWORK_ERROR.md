# Troubleshooting NetworkError with Google Apps Script

If you're getting a "NetworkError when attempting to fetch resource" error, follow these steps:

## Common Causes and Solutions

### 1. Script Not Properly Deployed

**Check:**
- Go to Google Apps Script editor
- Click **Deploy** → **Manage deployments**
- Verify there's an active deployment
- The deployment should show "Web app" type

**Fix:**
- If no deployment exists, create a new one:
  - Click **Deploy** → **New deployment**
  - Select **Web app** type
  - Set "Execute as" to **Me**
  - Set "Who has access" to **Anyone**
  - Click **Deploy**

### 2. CORS Issues

**Check:**
- Verify "Who has access" is set to **Anyone** (not "Only myself")
- The script must be deployed (not just saved) for CORS to work

**Fix:**
- Redeploy the script with "Anyone" access
- Make sure you're using the Web App URL (ends with `/exec`), not the editor URL

### 3. Script Authorization

**Check:**
- The script needs to be authorized to access your Google Sheet

**Fix:**
- In Apps Script editor, go to **Deploy** → **Manage deployments**
- Click the edit icon (pencil) next to your deployment
- Click **Authorize access** if prompted
- Grant all necessary permissions

### 4. Sheet ID Not Configured

**Check:**
- Open your Apps Script file
- Verify `SPREADSHEET_ID` is set to your actual Sheet ID (not 'YOUR_SPREADSHEET_ID_HERE')

**Fix:**
- Get your Sheet ID from the Google Sheet URL
- Update the `SPREADSHEET_ID` constant in the script
- Save and redeploy as a new version

### 5. Testing the Endpoint Directly

Test if the endpoint is accessible:

1. Open your Web App URL in a browser:
   ```
   https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

2. You should see a JSON response like:
   ```json
   {"success":true,"data":[]}
   ```

3. If you see an error page or "Script function not found", the script isn't deployed correctly

### 6. Browser Console Errors

Check the browser console (F12) for specific error messages:
- **CORS error**: Script not deployed with "Anyone" access
- **401 Unauthorized**: Script needs re-authorization
- **404 Not Found**: Wrong URL or script not deployed
- **NetworkError**: Could be CORS, deployment, or network issue

### 7. Quick Fix: Redeploy Script

Sometimes a fresh deployment fixes issues:

1. In Apps Script editor, go to **Deploy** → **Manage deployments**
2. Click the edit icon (pencil)
3. Change version to **New version**
4. Click **Deploy**
5. Copy the new Web App URL (it should be the same)
6. Update your `.env` file if the URL changed
7. Restart your dev server

### 8. Verify Environment Variable

Make sure the `.env` file is in the project root and contains:
```
VITE_RSVP_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

Then restart your dev server:
```bash
npm run dev
```

## Still Having Issues?

1. **Check the Apps Script execution logs:**
   - In Apps Script editor, go to **Executions** (left sidebar)
   - Look for recent executions and any error messages

2. **Test with a simple GET request:**
   - Open the Web App URL directly in your browser
   - You should see JSON data, not an error page

3. **Verify the Sheet exists and is accessible:**
   - Make sure the Google Sheet is not deleted
   - Check that the Sheet ID in the script matches the actual sheet

4. **Check browser network tab:**
   - Open DevTools (F12) → Network tab
   - Try submitting an RSVP
   - Look at the failed request to see the exact error

