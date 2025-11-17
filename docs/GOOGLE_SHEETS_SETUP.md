# Google Sheets RSVP Backend Setup Guide

This guide will walk you through setting up a Google Sheets-based backend for storing RSVP data from the Thanksgiving invitation app.

## Prerequisites

- A Google account
- Access to Google Sheets and Google Apps Script

## Step 1: Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it **"RSVP Database"**
4. Set up the header row (Row 1) with the following columns:
   - **A1**: Timestamp
   - **B1**: Name
   - **C1**: Email
   - **D1**: Phone
   - **E1**: Attending
   - **F1**: Number of Guests
   - **G1**: Dietary Restrictions
   - **H1**: Drink/Treat Contribution
   - **I1**: Comments

5. Format the header row (optional but recommended):
   - Select row 1
   - Make it bold
   - Add a background color (e.g., light gray)

6. **Get your Sheet ID**:
   - Look at the URL in your browser
   - The URL will look like: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit`
   - Copy the `YOUR_SHEET_ID_HERE` part (the long string between `/d/` and `/edit`)

   https://docs.google.com/spreadsheets/d/1Qh1AvrFoe3Q7OlFSJn07Ii7rk2jDnUbizm9Uy7eKh-Q/edit?usp=sharing

## Step 2: Create the Google Apps Script

1. In your Google Sheet, click on **Extensions** → **Apps Script**
2. This will open a new tab with the Apps Script editor
3. Delete any default code in the editor
4. Copy the entire contents of `google-apps-script/RSVP_API.gs` from this project
5. Paste it into the Apps Script editor
6. **Update the configuration**:
   - Find the line: `const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';`
   - Replace `YOUR_SPREADSHEET_ID_HERE` with your actual Sheet ID from Step 1
   - **Example**: If your Sheet URL is `https://docs.google.com/spreadsheets/d/1Qh1AvrFoe3Q7OlFSJn07Ii7rk2jDnUbizm9Uy7eKh-Q/edit`, then:
     ```javascript
     const SPREADSHEET_ID = '1Qh1AvrFoe3Q7OlFSJn07Ii7rk2jDnUbizm9Uy7eKh-Q';
     ```
   - If your sheet tab is not named "Sheet1", update `SHEET_NAME` accordingly
   - **IMPORTANT**: After updating, you MUST save the script and redeploy it (see Step 3)

## Step 3: Deploy as Web App

1. In the Apps Script editor, click **Deploy** → **New deployment**
2. Click the gear icon (⚙️) next to "Select type" and choose **Web app**
3. Configure the deployment:
   - **Description**: "RSVP API v1" (or any description you prefer)
   - **Execute as**: **Me** (your Google account)
   - **Who has access**: **Anyone** (this is required for CORS to work)
4. Click **Deploy**
5. **Authorize the script**:
   - You'll be prompted to authorize the script
   - Click **Authorize access**
   - Choose your Google account
   - **You'll see a warning**: "This app hasn't been verified by Google"
   - This is **normal and safe** for personal projects
   - Click **Advanced** → **Go to [Project Name] (unsafe)**
   - Click **Allow** to grant permissions
   - **Note**: This warning appears because the app hasn't gone through Google's OAuth verification process, which is only required for public apps. For personal/internal use, it's safe to proceed.
6. **Copy the Web App URL**:
   - After deployment, you'll see a "Web app" URL
   - It will look like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`
   - **IMPORTANT**: Make sure the URL ends with `/exec` (not `/dev`)
   - The `/dev` URL is for testing only and won't work for production
   - **Copy this URL** - you'll need it for the frontend configuration
   - **Example**: `https://script.google.com/macros/s/AKfycbyWN1FfTG5fUW02_0Sr3rjjspF_y7VYSNv_ypJFsNU/exec`

## Step 4: Configure the Frontend

1. In the project root, create a `.env` file (or copy from `.env.example`)
2. Add the following line:
   ```
   VITE_RSVP_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```
   Replace `YOUR_SCRIPT_ID` with your actual Web App URL from Step 3
   
   **Example:**
   ```
https://script.google.com/macros/s/AKfycbz_w-at4yiCdxlQBcXIWnzdUPFurc2-JOAX7jYSjLnucKfVi-ASO6JehY-zX3IF-XUK/exec
   ```

3. **Restart your development server**:
   ```bash
   npm run dev
   ```

## Step 5: Test the Integration

1. Open your app in the browser
2. Navigate to the RSVP section
3. Fill out and submit a test RSVP
4. Check your Google Sheet - you should see a new row with the RSVP data
5. Refresh the page - the RSVP should appear in the "Who's Coming" list

## Troubleshooting

### CORS Errors
- Make sure "Who has access" is set to **Anyone** in the deployment settings
- The script must be deployed (not just saved) for CORS headers to work

### 401 Unauthorized Errors
- Re-authorize the script: In Apps Script editor, go to **Deploy** → **Manage deployments** → Click the edit icon → Re-authorize

### Data Not Appearing
- Check the browser console for errors
- Verify the Sheet ID is correct in the Apps Script
- Make sure the sheet name matches (default is "Sheet1")
- Check that the headers are in row 1 exactly as specified

### API Endpoint Not Working
- Verify the Web App URL is correct in your `.env` file
- Make sure the script is deployed (not just saved)
- Check that the deployment is active in **Deploy** → **Manage deployments**

## Security Notes

- The Web App URL is public, but only authorized users (you) can execute the script
- The sheet itself should have appropriate sharing settings
- Consider adding rate limiting or authentication if needed for production use

## Updating the Script

If you need to update the Apps Script code:

1. Make your changes in the Apps Script editor
2. Go to **Deploy** → **Manage deployments**
3. Click the edit icon (pencil) next to your deployment
4. Change the version to **New version**
5. Click **Deploy**
6. No need to update the Web App URL - it stays the same

## Data Format

The API expects the following JSON format for POST requests:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 555-1234",
  "item": "Apple Pie",
  "dietaryRestrictions": "Vegetarian"
}
```

The API returns data in this format:

```json
{
  "success": true,
  "data": [
    {
      "id": "row_2",
      "timestamp": "2024-11-16T12:00:00.000Z",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1 555-1234",
      "attending": "Yes",
      "numberOfGuests": "1",
      "dietaryRestrictions": "Vegetarian",
      "item": "Apple Pie",
      "comments": "",
      "submittedAt": "2024-11-16T12:00:00.000Z"
    }
  ]
}
```

