# Thanksgiving Dinner Invitation App

A beautiful, responsive web application for managing a Thanksgiving dinner invitation with RSVP functionality, menu display, and event information.

## Features

- **Event Information**: Display date, time, location, dress code, and special notes
- **Interactive Menu**: Browse Thanksgiving dishes with hoverable ingredient lists and historical context
- **RSVP System**: Guests can RSVP and specify what they're bringing
- **Google Sheets Backend**: RSVP data is stored in Google Sheets via Google Apps Script API
- **CORS Proxy**: Cloud Run proxy service handles CORS and forwards requests to Google Apps Script
- **Responsive Design**: Beautiful fall-themed UI that works on all devices
- **Vegetarian Indicators**: Menu items are marked with vegetarian-friendly icons

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Google Sheets + Google Apps Script
- **CORS Proxy**: Node.js/Express service on Cloud Run

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

4. For local development, create a `.env` file in the root directory:
   ```env
   VITE_RSVP_API_URL=https://your-proxy-service.run.app/api/rsvp
   ```
   For production, the proxy URL is set during Cloud Build deployment.

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

## Backend Setup

The app uses a two-tier backend architecture:

1. **Google Sheets + Apps Script**: Stores RSVP data
2. **Cloud Run CORS Proxy**: Handles CORS and forwards requests to Apps Script

### Google Sheets Setup

📖 **[Google Sheets Setup Guide](./docs/GOOGLE_SHEETS_SETUP.md)**

Quick overview:
1. Create a Google Sheet named "RSVP Database"
2. Set up columns: Timestamp, Name, Email, Phone, Attending, Number of Guests, Dietary Restrictions, Drink/Treat Contribution, Comments
3. Create a Google Apps Script with the code from `google-apps-script/RSVP_API_FIXED.gs`
4. Deploy as a web app
5. Note the Apps Script URL for proxy configuration

### CORS Proxy Setup

📖 **[CORS Proxy Setup Guide](./docs/CORS_PROXY_SETUP.md)**

The CORS proxy is automatically deployed as part of the Cloud Build process. For local development or manual deployment, see the guide above.

## Project Structure

```
Thanksgiving/
├── src/
│   ├── components/          # React components
│   │   ├── GeneralInfo.tsx  # Event information section
│   │   ├── MenuSection.tsx  # Menu with hoverable items
│   │   └── RsvpSection.tsx # RSVP form and list
│   ├── data/
│   │   └── menuItems.ts     # Menu data
│   ├── services/
│   │   └── rsvpService.ts   # RSVP API service
│   └── App.tsx              # Main app component
├── proxy/                    # CORS Proxy Service
│   ├── server.js            # Express proxy server
│   ├── package.json         # Proxy dependencies
│   └── Dockerfile           # Proxy container config
├── google-apps-script/
│   ├── RSVP_API.gs          # Google Apps Script API
│   └── RSVP_API_FIXED.gs    # Fixed version (uses ContentService)
├── docs/
│   ├── GOOGLE_SHEETS_SETUP.md    # Google Sheets setup
│   └── CORS_PROXY_SETUP.md       # CORS proxy setup
└── public/
    └── Images/              # Menu and logo images
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment to Google Cloud Run

The app can be deployed to Google Cloud Run for serverless hosting. See the comprehensive deployment guide:

📖 **[Cloud Run Deployment Guide](./docs/CLOUD_RUN_DEPLOYMENT.md)**

**Quick deployment (no Docker required):**
```bash
# Deploy using Cloud Build (builds both proxy and main app)
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_PROXY_SERVICE_NAME=rsvp-proxy,_REGION=us-central1,_APPS_SCRIPT_URL="YOUR_GOOGLE_APPS_SCRIPT_URL"
```

**Note**: The Cloud Build process automatically:
1. Builds and deploys the CORS proxy service
2. Gets the proxy service URL
3. Builds the main app with the proxy URL
4. Deploys the main app

**Alternative: Manual deployment** (see [CORS Proxy Setup Guide](./docs/CORS_PROXY_SETUP.md) for details):
1. Deploy proxy service first
2. Get proxy URL
3. Deploy main app with proxy URL

**Setting up automatic deployments?** See [Cloud Build Trigger Setup](./docs/CLOUD_BUILD_TRIGGER_SETUP.md)

## Environment Variables

- `VITE_RSVP_API_URL`: The Cloud Run CORS Proxy URL (e.g., `https://rsvp-proxy-xxx.run.app/api/rsvp`)
  - For production: Set during Cloud Build deployment
  - For local dev: Point to deployed proxy service or use proxy locally

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
- Check that `VITE_RSVP_API_URL` points to the CORS proxy (not Apps Script directly)
- Verify the proxy service is deployed and accessible
- Verify the Google Apps Script is deployed and accessible
- Check browser console for errors
- Check proxy service logs: `gcloud run services logs read rsvp-proxy --region us-central1`
- See [CORS Proxy Setup Guide](./docs/CORS_PROXY_SETUP.md) for detailed troubleshooting

### Images not loading
- Ensure images are in `public/Images/` directory
- Check that image paths match the case-sensitive filenames

## License

This project is for personal/educational use.

