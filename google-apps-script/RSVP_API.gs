/**
 * Google Apps Script for RSVP API
 * This script provides GET and POST endpoints for managing RSVP data in Google Sheets
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet named "RSVP Database"
 * 2. Set up columns in row 1: Timestamp, Name, Email, Phone, Attending, Number of Guests, Dietary Restrictions, Drink/Treat Contribution, Comments
 * 3. Copy the Sheet ID from the URL (between /d/ and /edit)
 * 4. Replace SPREADSHEET_ID below with your Sheet ID
 * 5. Deploy as a web app with "Execute as: Me" and "Who has access: Anyone"
 */

// ===== CONFIGURATION =====
const SPREADSHEET_ID = '1Qh1AvrFoe3Q7OlFSJn07Ii7rk2jDnUbizm9Uy7eKh-Q'; // Your Google Sheet ID
// IMPORTANT: Change this to match the actual name of your sheet tab
// Common names: 'Sheet1', 'RSVP Database', 'RSVP', etc.
const SHEET_NAME = 'Sheet1'; // Change to match your actual sheet tab name

// ===== HELPER FUNCTIONS =====

/**
 * Get the active spreadsheet
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * Get the data sheet
 */
function getDataSheet() {
  try {
    const ss = getSpreadsheet();
    if (!ss) {
      throw new Error('Could not access spreadsheet. Check SPREADSHEET_ID and permissions.');
    }
    
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      Logger.log('Sheet "' + SHEET_NAME + '" not found. Creating it...');
      sheet = ss.insertSheet(SHEET_NAME);
      // Set up headers
      sheet.getRange(1, 1, 1, 9).setValues([[
        'Timestamp',
        'Name',
        'Email',
        'Phone',
        'Attending',
        'Number of Guests',
        'Dietary Restrictions',
        'Drink/Treat Contribution',
        'Comments'
      ]]);
      // Format header row
      sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
      sheet.getRange(1, 1, 1, 9).setBackground('#f0f0f0');
      Logger.log('Sheet "' + SHEET_NAME + '" created successfully.');
    }
    
    if (!sheet) {
      throw new Error('Could not create or access sheet "' + SHEET_NAME + '". Available sheets: ' + ss.getSheets().map(s => s.getName()).join(', '));
    }
    
    return sheet;
  } catch (error) {
    Logger.log('Error in getDataSheet: ' + error.toString());
    throw error;
  }
}

/**
 * Send success response
 * Note: CORS headers are automatically handled by Google Apps Script
 * when the web app is deployed with "Who has access: Anyone"
 */
function sendSuccess(data, statusCode = 200) {
  const response = ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: data
  }));
  response.setMimeType(ContentService.MimeType.JSON);
  return response;
}

/**
 * Send error response
 */
function sendError(message, statusCode = 400) {
  const response = ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: message
  }));
  response.setMimeType(ContentService.MimeType.JSON);
  return response;
}

/**
 * Map frontend data to sheet row format
 */
function mapToSheetRow(data) {
  const timestamp = new Date();
  return [
    timestamp, // Timestamp
    data.name || '', // Name
    data.email || '', // Email
    data.phone || '', // Phone
    'Yes', // Attending (default to Yes since they're RSVPing)
    '1', // Number of Guests (default to 1)
    data.dietaryRestrictions || '', // Dietary Restrictions
    data.item || '', // Drink/Treat Contribution (maps from "item")
    '' // Comments (empty for now)
  ];
}

/**
 * Map sheet row to frontend format
 */
function mapFromSheetRow(row, index) {
  return {
    id: `row_${index + 1}`, // Use row number as ID
    timestamp: row[0] ? new Date(row[0]).toISOString() : '',
    name: row[1] || '',
    email: row[2] || '',
    phone: row[3] || '',
    attending: row[4] || 'Yes',
    numberOfGuests: row[5] || '1',
    dietaryRestrictions: row[6] || '',
    item: row[7] || '', // Maps to "Drink/Treat Contribution"
    comments: row[8] || '',
    submittedAt: row[0] ? new Date(row[0]).toISOString() : new Date().toISOString()
  };
}

// ===== API ENDPOINTS =====

/**
 * Handle OPTIONS request for CORS preflight
 * Note: Google Apps Script automatically handles CORS when deployed with "Anyone" access
 */
function doOptions() {
  return ContentService.createTextOutput('');
}

/**
 * Handle GET request - Retrieve all RSVPs
 */
function doGet(e) {
  try {
    const sheet = getDataSheet();
    
    // Check if sheet has data (more than just header row)
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      // Sheet only has header row, return empty array
      return sendSuccess([]);
    }
    
    // Get all data starting from row 2 (skip header)
    const dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
    const values = dataRange.getValues();
    
    // Map rows to frontend format
    const rsvps = values.map((row, index) => mapFromSheetRow(row, index));
    
    // Filter out empty rows
    const validRsvps = rsvps.filter(rsvp => rsvp.name && rsvp.name.trim() !== '');
    
    return sendSuccess(validRsvps);
  } catch (error) {
    Logger.log('GET Error: ' + error.toString());
    return sendError('Failed to retrieve RSVPs: ' + error.toString(), 500);
  }
}

/**
 * Handle POST request - Create new RSVP
 */
function doPost(e) {
  try {
    Logger.log('=== POST Request Received ===');
    Logger.log('Request contents: ' + (e.postData ? e.postData.contents : 'No postData'));
    
    // Parse JSON from request body
    // Works with both application/json and text/plain content types
    let requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
      Logger.log('Parsed request data: ' + JSON.stringify(requestData));
    } catch (parseError) {
      Logger.log('JSON Parse Error: ' + parseError.toString());
      return sendError('Invalid JSON in request body: ' + parseError.toString(), 400);
    }
    
    // Validate required fields
    if (!requestData.name || !requestData.item) {
      Logger.log('Validation failed: Missing name or item');
      return sendError('Name and item (drink/treat contribution) are required', 400);
    }
    
    Logger.log('Attempting to get spreadsheet: ' + SPREADSHEET_ID);
    Logger.log('Looking for sheet: ' + SHEET_NAME);
    
    // Get the sheet
    let sheet;
    try {
      sheet = getDataSheet();
      Logger.log('Sheet retrieved successfully: ' + sheet.getName());
    } catch (sheetError) {
      Logger.log('Error getting sheet: ' + sheetError.toString());
      return sendError('Failed to access Google Sheet: ' + sheetError.toString(), 500);
    }
    
    // Map data to sheet row format
    const rowData = mapToSheetRow(requestData);
    Logger.log('Mapped row data: ' + JSON.stringify(rowData));
    
    // Get row count before append
    const rowCountBefore = sheet.getLastRow();
    Logger.log('Rows before append: ' + rowCountBefore);
    
    // Append row to sheet
    try {
      sheet.appendRow(rowData);
      Logger.log('Row appended successfully');
    } catch (appendError) {
      Logger.log('Error appending row: ' + appendError.toString());
      return sendError('Failed to save RSVP to sheet: ' + appendError.toString(), 500);
    }
    
    // Verify the row was added
    const rowCountAfter = sheet.getLastRow();
    Logger.log('Rows after append: ' + rowCountAfter);
    
    if (rowCountAfter <= rowCountBefore) {
      Logger.log('WARNING: Row count did not increase after append!');
      return sendError('RSVP appeared to save but row count did not increase. Please check the sheet manually.', 500);
    }
    
    // Get the new row number
    const lastRow = sheet.getLastRow();
    
    // Read back the new row to return it
    const newRow = sheet.getRange(lastRow, 1, 1, 9).getValues()[0];
    Logger.log('Read back row: ' + JSON.stringify(newRow));
    
    const newRsvp = mapFromSheetRow(newRow, lastRow - 2); // -2 because we skip header and use 0-based index
    Logger.log('Mapped RSVP object: ' + JSON.stringify(newRsvp));
    Logger.log('=== POST Request Completed Successfully ===');
    
    return sendSuccess(newRsvp, 201);
  } catch (error) {
    Logger.log('POST Error: ' + error.toString());
    Logger.log('Error stack: ' + (error.stack || 'No stack trace'));
    return sendError('Failed to create RSVP: ' + error.toString(), 500);
  }
}
