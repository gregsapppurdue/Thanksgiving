/**
 * RSVP API - Google Apps Script
 * CORRECTED VERSION - Uses ContentService (not HtmlService)
 * 
 * IMPORTANT: Deploy with "Who has access: Anyone" for CORS to work automatically
 */

const SPREADSHEET_ID = '1Qh1AvrFoe3Q7OlFSJn07Ii7rk2jDnUbizm9Uy7eKh-Q';
const SHEET_NAME = 'Sheet1';

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
    // Format header row
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
    sheet.getRange(1, 1, 1, 9).setBackground('#f0f0f0');
  }

  return sheet;
}

function sendSuccess(data) {
  // Use ContentService (NOT HtmlService) - this returns proper JSON
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: data
  })).setMimeType(ContentService.MimeType.JSON);
}

function sendError(message) {
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: message
  })).setMimeType(ContentService.MimeType.JSON);
}

// --- Handle OPTIONS Preflight ---
function doOptions() {
  // Return empty response for OPTIONS
  // CORS headers are automatically added by Google Apps Script
  return ContentService.createTextOutput('');
}

// --- GET RSVPs ---
function doGet() {
  try {
    const sheet = getSheet();
    const last = sheet.getLastRow();

    if (last <= 1) {
      return sendSuccess([]);
    }

    const values = sheet.getRange(2, 1, last - 1, 9).getValues();
    const data = values
      .map((row, i) => ({
        id: `row_${i + 1}`,
        timestamp: row[0] ? new Date(row[0]).toISOString() : '',
        name: row[1] || '',
        email: row[2] || '',
        phone: row[3] || '',
        attending: row[4] || 'Yes',
        guests: row[5] || '1',
        dietaryRestrictions: row[6] || '',
        item: row[7] || '',
        comments: row[8] || '',
        submittedAt: row[0] ? new Date(row[0]).toISOString() : new Date().toISOString()
      }))
      .filter(rsvp => rsvp.name && rsvp.name.trim() !== ''); // Filter empty rows

    return sendSuccess(data);
  } catch (error) {
    Logger.log('GET Error: ' + error.toString());
    return sendError('Failed to retrieve RSVPs: ' + error.toString());
  }
}

// --- POST RSVP ---
function doPost(e) {
  try {
    Logger.log('=== POST Request Received ===');
    Logger.log('Request contents: ' + (e.postData ? e.postData.contents : 'No postData'));

    // Parse JSON from request body
    let body;
    try {
      body = JSON.parse(e.postData.contents);
      Logger.log('Parsed request data: ' + JSON.stringify(body));
    } catch (parseError) {
      Logger.log('JSON Parse Error: ' + parseError.toString());
      return sendError('Invalid JSON in request body: ' + parseError.toString());
    }

    // Validate required fields
    if (!body.name || !body.item) {
      Logger.log('Validation failed: Missing name or item');
      return sendError('Missing required fields: name and item');
    }

    const sheet = getSheet();
    Logger.log('Sheet retrieved: ' + sheet.getName());

    const row = [
      new Date(),
      body.name || '',
      body.email || '',
      body.phone || '',
      'Yes',
      body.guests || '1',
      body.dietaryRestrictions || '',
      body.item || '',
      body.comments || ''
    ];

    Logger.log('Appending row: ' + JSON.stringify(row));

    // Get row count before append
    const rowCountBefore = sheet.getLastRow();
    Logger.log('Rows before append: ' + rowCountBefore);

    // Append row
    sheet.appendRow(row);

    // Verify row was added
    const rowCountAfter = sheet.getLastRow();
    Logger.log('Rows after append: ' + rowCountAfter);

    if (rowCountAfter <= rowCountBefore) {
      Logger.log('WARNING: Row count did not increase!');
      return sendError('Failed to save RSVP - row was not added');
    }

    // Read back the new row
    const lastRow = sheet.getLastRow();
    const newRow = sheet.getRange(lastRow, 1, 1, 9).getValues()[0];

    const newRsvp = {
      id: `row_${lastRow - 1}`,
      timestamp: newRow[0] ? new Date(newRow[0]).toISOString() : new Date().toISOString(),
      name: newRow[1] || '',
      email: newRow[2] || '',
      phone: newRow[3] || '',
      attending: newRow[4] || 'Yes',
      guests: newRow[5] || '1',
      dietaryRestrictions: newRow[6] || '',
      item: newRow[7] || '',
      comments: newRow[8] || '',
      submittedAt: newRow[0] ? new Date(newRow[0]).toISOString() : new Date().toISOString()
    };

    Logger.log('RSVP saved successfully: ' + JSON.stringify(newRsvp));
    Logger.log('=== POST Request Completed Successfully ===');

    return sendSuccess(newRsvp);
  } catch (err) {
    Logger.log('POST Error: ' + err.toString());
    Logger.log('Error stack: ' + (err.stack || 'No stack trace'));
    return sendError(err.toString());
  }
}

