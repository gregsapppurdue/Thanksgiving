# Quick Fix: Connection Issues

## Step 1: Verify Google Apps Script Configuration

**CRITICAL**: Make sure you've updated the `SPREADSHEET_ID` in your Google Apps Script!

1. Open your Google Apps Script editor
2. Check this line:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```
3. **It MUST be replaced** with your actual Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/1Qh1AvrFoe3Q7OlFSJn07Ii7rk2jDnUbizm9Uy7eKh-Q/edit
   ```
   The Sheet ID is: `1Qh1AvrFoe3Q7OlFSJn07Ii7rk2jDnUbizm9Uy7eKh-Q`

4. Update the line to:
   ```javascript
   const SPREADSHEET_ID = '1Qh1AvrFoe3Q7OlFSJn07Ii7rk2jDnUbizm9Uy7eKh-Q';
   ```

5. **Save the script** (Ctrl+S or Cmd+S)

## Step 2: Redeploy the Script

After updating the SPREADSHEET_ID, you MUST redeploy:

1. In Apps Script editor, click **Deploy** → **Manage deployments**
2. Click the edit icon (pencil) next to your deployment
3. Change version to **New version**
4. Click **Deploy**
5. The Web App URL stays the same - no need to update `.env`

## Step 3: Test the Endpoint Directly

Open this URL in your browser:
```
https://script.google.com/macros/s/AKfycbxToc0UHoqQCg6I4ycLiLQNimKaIoqp3tdgMAvXcwva3xI1Tp86z1K7j5BP-_PHq6G8/exec
```

**Expected result**: You should see:
```json
{"success":true,"data":[]}
```

**If you see an error**:
- "Script function not found" → Script not deployed
- "We're sorry, a server error occurred" → Check SPREADSHEET_ID is correct
- Blank page or 404 → Wrong URL or not deployed

## Step 4: Restart Dev Server

After making changes:

1. Stop your dev server (Ctrl+C)
2. Restart it:
   ```bash
   npm run dev
   ```

## Step 5: Check Browser Console

1. Open your app in the browser
2. Press F12 to open DevTools
3. Go to the **Console** tab
4. Try to load RSVPs or submit one
5. Look for specific error messages

## Common Issues Checklist

- [ ] SPREADSHEET_ID is updated in Apps Script (not 'YOUR_SPREADSHEET_ID_HERE')
- [ ] Script is saved after updating SPREADSHEET_ID
- [ ] Script is deployed (not just saved)
- [ ] Deployment has "Who has access" set to "Anyone"
- [ ] Script is authorized (you clicked "Allow" when prompted)
- [ ] .env file exists with correct URL
- [ ] Dev server was restarted after creating .env
- [ ] Browser console shows specific error (check Network tab)

## Still Not Working?

Check the Apps Script execution logs:

1. In Apps Script editor, click **Executions** (left sidebar)
2. Look for recent executions
3. Click on any failed execution to see the error message
4. Common errors:
   - "Cannot find Spreadsheet" → Wrong SPREADSHEET_ID
   - "Permission denied" → Script not authorized
   - "Function not found" → Script not deployed

