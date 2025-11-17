/**
 * RSVP API - Google Apps Script with FULL CORS SUPPORT
 */

const SPREADSHEET_ID = '1Qh1AvrFoe3Q7OlFSJn07Ii7rk2jDnUbizm9Uy7eKh-Q';
const SHEET_NAME = 'Sheet1';

// --- CORS WRAPPER (ONLY METHOD THAT WORKS) ---
function corsResponse(jsonString) {
  const template = HtmlService.createHtmlOutput();

  template.append(`
    <script>
      const response = ${jsonString};
      const origin = "*";
      const headers = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      };

      // Send the JSON back to fetch()
      parent.postMessage({ response, headers }, "*");
    </script>
  `);

  template.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return template;
}

// --- Handle OPTIONS Preflight ---
function doOptions() {
  return corsResponse(JSON.stringify({ success: true }));
}

// --- Helpers ---
function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Timestamp', 'Name', 'Email', 'Phone',
      'Attending', 'Guests', 'Dietary Restrictions',
      'Contribution', 'Comments'
    ]);
  }

  return sheet;
}

// --- GET RSVPs ---
function doGet() {
  const sheet = getSheet();
  const last = sheet.getLastRow();

  if (last <= 1) {
    return corsResponse(JSON.stringify({ success: true, data: [] }));
  }

  const values = sheet.getRange(2, 1, last - 1, 9).getValues();
  const data = values.map((row, i) => ({
    id: i + 1,
    timestamp: row[0],
    name: row[1],
    email: row[2],
    phone: row[3],
    attending: row[4],
    guests: row[5],
    dietaryRestrictions: row[6],
    item: row[7],
    comments: row[8]
  }));

  return corsResponse(JSON.stringify({ success: true, data }));
}

// --- POST RSVP ---
function doPost(e) {
  try {
    const sheet = getSheet();

    const body = JSON.parse(e.postData.contents);
    if (!body.name || !body.item) {
      return corsResponse(JSON.stringify({
        success: false,
        error: "Missing required: name, item"
      }));
    }

    const row = [
      new Date(),
      body.name,
      body.email || "",
      body.phone || "",
      "Yes",
      body.guests || "1",
      body.dietaryRestrictions || "",
      body.item || "",
      body.comments || ""
    ];

    sheet.appendRow(row);

    return corsResponse(JSON.stringify({
      success: true,
      message: "RSVP saved",
      data: row
    }));

  } catch (err) {
    return corsResponse(JSON.stringify({
      success: false,
      error: err.toString()
    }));
  }
}
