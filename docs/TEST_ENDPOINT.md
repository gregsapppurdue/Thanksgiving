# Testing the Google Apps Script Endpoint

## Quick Test

Open this URL directly in your browser:
```
https://script.google.com/macros/s/AKfycbw8kQ-VBrdIZuwUSPcdJKPAfqAnnuqBLS-UvspNmV77n8t7fDrZmTldrhmqQ8JjXzF8/exec
```

**Expected Result:**
```json
{"success":true,"data":[]}
```

**If you see an error instead**, the script has an issue.

## Common Issues

### 1. Script Not Deployed
- Go to Apps Script → **Deploy** → **Manage deployments**
- Make sure there's an active deployment
- The URL should end with `/exec` (not `/dev`)

### 2. SPREADSHEET_ID Not Set
- Open your Apps Script code
- Check: `const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';`
- It MUST be replaced with your actual Sheet ID
- Example: `const SPREADSHEET_ID = '1Qh1AvrFoe3Q7OlFSJn07Ii7rk2jDnUbizm9Uy7eKh-Q';`

### 3. Script Not Authorized
- The script needs permission to access your Google Sheet
- Go to **Deploy** → **Manage deployments** → Edit → **Authorize access**

### 4. Check Execution Logs
- In Apps Script editor, click **Executions** (left sidebar)
- Look for failed executions
- Click on them to see the error message

## Testing with curl (Optional)

If you have curl installed, you can test from the command line:

```bash
curl "https://script.google.com/macros/s/AKfycbw8kQ-VBrdIZuwUSPcdJKPAfqAnnuqBLS-UvspNmV77n8t7fDrZmTldrhmqQ8JjXzF8/exec"
```

You should see: `{"success":true,"data":[]}`

