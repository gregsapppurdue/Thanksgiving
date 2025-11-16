Google Sheets RSVP Backend Implementation
Overview
Replace the in-memory RSVP storage with a Google Sheets backend using Google Apps Script to provide REST API endpoints. The solution will store RSVP data in a Google Sheet and expose GET/POST endpoints with CORS support.

Implementation Steps
1. Google Sheet Setup Instructions
Create a Google Sheet named "RSVP Database"
Set up columns in row 1: Timestamp, Name, Email, Phone, Attending (Yes/No), Number of Guests, Dietary Restrictions, Drink/Treat Contribution, Comments
Note: The current frontend uses "item" for what they're bringing, which maps to "Drink/Treat Contribution"
Document the Sheet ID for use in the Apps Script
2. Google Apps Script API
Create google-apps-script/RSVP_API.gs with:
Configuration for Sheet ID and sheet name
doPost(e) function to handle POST requests (create RSVP)
doGet(e) function to handle GET requests (retrieve all RSVPs)
CORS headers for cross-origin requests
JSON parsing and validation
Error handling and response formatting
Helper functions to map frontend data structure to sheet columns
3. Frontend Service Update
Update src/services/rsvpService.ts to:
Replace in-memory storage with fetch calls to Google Apps Script web app URL
Add environment variable or configuration for the API endpoint URL
Update fetchRsvps() to call GET endpoint
Update submitRsvp() to call POST endpoint with proper data mapping
Handle API errors gracefully
Map frontend field names to sheet column names (e.g., "item" → "Drink/Treat Contribution")
4. Data Mapping
Frontend fields → Sheet columns:
name → Name
email → Email
phone → Phone
item → Drink/Treat Contribution
dietaryRestrictions → Dietary Restrictions
Timestamp → auto-generated
Attending → default to "Yes" (since they're RSVPing)
Number of Guests → default to 1 (or add field later)
Comments → empty (or add field later)
5. Configuration & Deployment
Create docs/GOOGLE_SHEETS_SETUP.md with:
Step-by-step instructions for creating the Google Sheet
Instructions for creating and deploying the Google Apps Script
How to get the web app URL
How to configure CORS and permissions
Environment variable setup for the frontend
6. Testing & Error Handling
Add error handling for:
Network failures
Invalid responses
Missing configuration
Update UI to show appropriate error messages
Test with sample data
Files to Create/Modify
New Files:
google-apps-script/RSVP_API.gs - Google Apps Script code
docs/GOOGLE_SHEETS_SETUP.md - Setup instructions
.env.example - Example environment variables
Modified Files:
src/services/rsvpService.ts - Update to use Google Sheets API
README.md - Add backend setup instructions
Notes
The user will need to manually create the Google Sheet and deploy the Apps Script
The web app URL from Google Apps Script will need to be configured in the frontend
CORS will be handled in the Apps Script code
The solution maintains backward compatibility with the existing frontend structure