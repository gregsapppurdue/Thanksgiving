# Troubleshooting: RSVP Shows Success But Doesn't Save to Google Sheet

## Problem
You see "Thank you! Your RSVP has been recorded" but the data doesn't appear in your Google Sheet.

## Quick Diagnosis Steps

### Step 1: Check Google Apps Script Execution Logs

1. Go to [Google Apps Script](https://script.google.com/home)
2. Open your RSVP API project
3. Click **Executions** (left sidebar)
4. Look for recent POST requests
5. Click on the most recent execution
6. Check the logs for errors

**What to look for:**
- ✅ `Row appended successfully` - Good! Row was saved
- ❌ `Error appending row` - Problem saving to sheet
- ❌ `Failed to access Google Sheet` - Permission or sheet name issue
- ❌ `Sheet not found` - Sheet name mismatch

### Step 2: Verify Sheet Name

The script looks for a sheet named `Sheet1` by default. Check your actual sheet:

1. Open your Google Sheet
2. Look at the tab name at the bottom
3. Common names: `Sheet1`, `RSVP Database`, `RSVP`

**If the name doesn't match:**
1. Either rename your sheet tab to `Sheet1`
2. Or update `SHEET_NAME` in the Google Apps Script:
   ```javascript
   const SHEET_NAME = 'YourActualSheetName'; // Change this
   ```
3. Save and redeploy the script

### Step 3: Verify Spreadsheet ID

1. Open your Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
3. Copy the `SPREADSHEET_ID` (the long string between `/d/` and `/edit`)
4. Open your Google Apps Script
5. Check this line:
   ```javascript
   const SPREADSHEET_ID = '1Qh1AvrFoe3Q7OlFSJn07Ii7rk2jDnUbizm9Uy7eKh-Q';
   ```
6. Make sure it matches your actual Sheet ID

### Step 4: Check Sheet Permissions

1. Open your Google Sheet
2. Click **Share** button
3. Make sure your Google account (the one running the script) has **Editor** access
4. The script runs as "Me" (your account), so you need edit permissions

### Step 5: Test the Endpoint Directly

Test if the POST endpoint is working:

```bash
curl -X POST "https://script.google.com/macros/s/AKfycbxToc0UHoqQCg6I4ycLiLQNimKaIoqp3tdgMAvXcwva3xI1Tp86z1K7j5BP-_PHq6G8/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"name":"Test User","item":"Test Item"}'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "id": "row_1",
    "name": "Test User",
    "item": "Test Item",
    ...
  }
}
```

**Then check your Google Sheet** - you should see a new row with "Test User" and "Test Item".

### Step 6: Check Browser Console

1. Open your app in the browser
2. Press F12 → Console tab
3. Submit an RSVP
4. Look for these logs:
   - `📤 Submitting RSVP to: ...`
   - `📥 Response status: 200`
   - `✅ RSVP successfully saved: ...`

**If you see:**
- `✅ RSVP successfully saved:` - The API returned success
- But data isn't in the sheet - The script returned success but didn't actually save

## Common Issues and Fixes

### Issue 1: Sheet Name Mismatch

**Symptoms:**
- Execution logs show: "Sheet not found"
- Script creates a new sheet instead of using existing one

**Fix:**
1. Check the actual sheet tab name
2. Update `SHEET_NAME` in the script to match
3. Save and redeploy

### Issue 2: Wrong Spreadsheet ID

**Symptoms:**
- Execution logs show: "Could not access spreadsheet"
- Script can't find the sheet

**Fix:**
1. Get the correct Sheet ID from the URL
2. Update `SPREADSHEET_ID` in the script
3. Save and redeploy

### Issue 3: Permission Denied

**Symptoms:**
- Execution logs show permission errors
- Script can't write to the sheet

**Fix:**
1. Make sure your Google account has Editor access to the sheet
2. The script runs as "Me" (your account)
3. Check Share settings in the Google Sheet

### Issue 4: Script Not Redeployed After Changes

**Symptoms:**
- You updated the script but changes aren't taking effect

**Fix:**
1. After updating `SPREADSHEET_ID` or `SHEET_NAME`, you MUST redeploy
2. Go to **Deploy** → **Manage deployments**
3. Click edit (pencil icon)
4. Select **New version**
5. Click **Deploy**

### Issue 5: Multiple Sheets with Same Name

**Symptoms:**
- Data might be going to a different sheet

**Fix:**
1. Check all sheets in your spreadsheet
2. Make sure there's only one sheet with the name you're using
3. Or use a unique name

## Step-by-Step Verification

1. **Submit a test RSVP** through your app
2. **Check execution logs** in Google Apps Script
3. **Look for** `Row appended successfully` in the logs
4. **Check your Google Sheet** - refresh the page
5. **Verify the data** appears in the correct sheet

## Getting Detailed Logs

The updated script now logs:
- When POST request is received
- Parsed request data
- Sheet access attempts
- Row append operations
- Verification that row was added

Check these logs in **Executions** → Click on the execution → View logs.

## Still Not Working?

If you've checked all the above:

1. **Share your execution logs** (screenshot or copy/paste)
2. **Verify the sheet URL** matches the `SPREADSHEET_ID` in the script
3. **Check if data is going to a different sheet** - look at all tabs
4. **Try creating a new deployment** - sometimes deployments get stale

## Quick Test Script

You can also test the script directly in the Apps Script editor:

1. Open the script editor
2. Create a test function:
   ```javascript
   function testPost() {
     const testData = {
       name: "Test User",
       item: "Test Item",
       email: "test@example.com"
     };
     const mockEvent = {
       postData: {
         contents: JSON.stringify(testData)
       }
     };
     const result = doPost(mockEvent);
     Logger.log(result.getContent());
   }
   ```
3. Run it (click Run → `testPost`)
4. Check the logs and your sheet

