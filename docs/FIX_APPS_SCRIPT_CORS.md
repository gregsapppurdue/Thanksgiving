# Fix: Google Apps Script Not Working - CORS Issue

## The Problem

Your script uses `HtmlService.createHtmlOutput()` with `postMessage`, which **doesn't work** with `fetch()` API calls. This approach:

1. Returns HTML instead of JSON
2. Uses `postMessage` which only works in iframes
3. Won't be parseable by `response.json()` in your frontend

## The Solution

Use `ContentService.createTextOutput()` instead. Google Apps Script **automatically handles CORS** when deployed with "Who has access: Anyone".

## Corrected Code

Replace your entire script with the corrected version in `google-apps-script/RSVP_API_FIXED.gs`.

### Key Changes:

1. **Removed `HtmlService`** - Use `ContentService` instead
2. **Removed `corsResponse` function** - Not needed, CORS is automatic
3. **Use `ContentService.createTextOutput()`** - Returns proper JSON
4. **Set MIME type to JSON** - So browsers parse it correctly

## Deployment Steps

1. **Copy the corrected code** from `RSVP_API_FIXED.gs`
2. **Paste into Google Apps Script** editor
3. **Save** the script
4. **Deploy**:
   - Click **Deploy** → **Manage deployments**
   - Click **Edit** (pencil icon)
   - Select **New version**
   - Ensure settings are:
     - **Execute as:** Me
     - **Who has access:** Anyone ← **CRITICAL for CORS**
   - Click **Deploy**

## Why Your Original Code Didn't Work

### ❌ Wrong Approach (Your Code):
```javascript
function corsResponse(jsonString) {
  const template = HtmlService.createHtmlOutput();
  template.append(`<script>...postMessage...</script>`);
  return template; // Returns HTML, not JSON!
}
```

**Problems:**
- Returns HTML page with embedded script
- `fetch()` tries to parse as JSON → fails
- `postMessage` only works in iframe contexts
- Frontend can't read the response

### ✅ Correct Approach:
```javascript
function sendSuccess(data) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: data
  })).setMimeType(ContentService.MimeType.JSON);
}
```

**Why it works:**
- Returns actual JSON text
- `fetch()` can parse with `response.json()`
- CORS headers added automatically by Google Apps Script
- Works with standard HTTP requests

## Testing

After deploying the corrected script:

1. **Test GET:**
   ```bash
   curl "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
   ```
   Should return: `{"success":true,"data":[]}`

2. **Test POST:**
   ```bash
   curl -X POST "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec" \
     -H "Content-Type: text/plain;charset=utf-8" \
     -d '{"name":"Test","item":"Test Item"}'
   ```
   Should return: `{"success":true,"data":{...}}`

3. **Check your Google Sheet** - Data should appear

## Important Notes

- **Don't manually set CORS headers** - Google Apps Script does this automatically
- **Use `ContentService`** - Not `HtmlService`
- **Deploy with "Anyone" access** - Required for CORS
- **Return JSON strings** - Not HTML templates

## Common Mistakes

1. ❌ Using `HtmlService` for API responses
2. ❌ Trying to manually set CORS headers (not supported)
3. ❌ Using `postMessage` for direct fetch requests
4. ❌ Returning HTML instead of JSON

## Verification

After fixing, check:
- ✅ Browser console shows successful API calls
- ✅ `response.json()` parses correctly
- ✅ Data appears in Google Sheet
- ✅ No CORS errors in browser console

