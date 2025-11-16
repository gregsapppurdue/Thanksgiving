# Thanksgiving Dinner Invitation App

A beautiful, responsive web application for managing a Thanksgiving dinner invitation with RSVP functionality, menu display, and event information.

## Features

- **Event Information**: Display date, time, location, dress code, and special notes
- **Interactive Menu**: Browse Thanksgiving dishes with hoverable ingredient lists and historical context
- **RSVP System**: Guests can RSVP and specify what they're bringing
- **Google Sheets Backend**: RSVP data is stored in Google Sheets via Google Apps Script API
- **Responsive Design**: Beautiful fall-themed UI that works on all devices
- **Vegetarian Indicators**: Menu items are marked with vegetarian-friendly icons

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Google Sheets + Google Apps Script

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Google account (for RSVP backend setup)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the Google Sheets backend (see [Setup Guide](./docs/GOOGLE_SHEETS_SETUP.md))

4. Create a `.env` file in the root directory:
   ```env
   VITE_RSVP_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```
   Replace `YOUR_SCRIPT_ID` with your Google Apps Script Web App URL.

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

## Google Sheets Backend Setup

The app uses Google Sheets as a backend for storing RSVP data. Follow the detailed setup guide:

📖 **[Google Sheets Setup Guide](./docs/GOOGLE_SHEETS_SETUP.md)**

Quick overview:
1. Create a Google Sheet named "RSVP Database"
2. Set up columns: Timestamp, Name, Email, Phone, Attending, Number of Guests, Dietary Restrictions, Drink/Treat Contribution, Comments
3. Create a Google Apps Script with the code from `google-apps-script/RSVP_API.gs`
4. Deploy as a web app
5. Configure the API URL in your `.env` file

## Project Structure

```
Thanksgiving/
├── src/
│   ├── components/          # React components
│   │   ├── GeneralInfo.tsx  # Event information section
│   │   ├── MenuSection.tsx  # Menu with hoverable items
│   │   └── RsvpSection.tsx # RSVP form and list
│   ├── data/
│   │   └── menuItems.js     # Menu data
│   ├── services/
│   │   └── rsvpService.js   # RSVP API service
│   └── App.tsx              # Main app component
├── google-apps-script/
│   └── RSVP_API.gs          # Google Apps Script API
├── docs/
│   └── GOOGLE_SHEETS_SETUP.md # Setup instructions
└── public/
    └── Images/              # Menu and logo images
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Environment Variables

- `VITE_RSVP_API_URL`: The Google Apps Script Web App URL for the RSVP API

## Features in Detail

### Menu Section
- Displays Thanksgiving dishes grouped by course
- Hover over items to see full ingredient lists and historical context
- Vegetarian-friendly items are marked with a 🌿 icon
- Responsive grid layout

### RSVP Section
- Form to submit RSVP with:
  - Name (required)
  - Email (optional)
  - Phone number (optional, for WhatsApp group)
  - What you're bringing (required)
  - Dietary restrictions (optional)
- Real-time display of all RSVPs
- Data persists in Google Sheets

## Troubleshooting

### RSVP not working
- Check that `VITE_RSVP_API_URL` is set in your `.env` file
- Verify the Google Apps Script is deployed and accessible
- Check browser console for errors
- See [Setup Guide](./docs/GOOGLE_SHEETS_SETUP.md) for detailed troubleshooting

### Images not loading
- Ensure images are in `public/Images/` directory
- Check that image paths match the case-sensitive filenames

## License

This project is for personal/educational use.

