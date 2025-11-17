# Thanksgiving Dinner Invitation App

A beautiful, responsive web application for managing a Thanksgiving dinner invitation with RSVP functionality, menu display, and event information.

## Features

- **Event Information**: Display date, time, location, dress code, and special notes
- **Interactive Menu**: Browse Thanksgiving dishes with hoverable ingredient lists and historical context
- **RSVP System**: Guests can RSVP via embedded Google Form
- **Responsive Design**: Beautiful fall-themed UI that works on all devices
- **Vegetarian Indicators**: Menu items are marked with vegetarian-friendly icons

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

## Project Structure

```
Thanksgiving/
├── src/
│   ├── components/          # React components
│   │   ├── GeneralInfo.tsx  # Event information section
│   │   ├── MenuSection.tsx  # Menu with hoverable items
│   │   └── RsvpSection.tsx  # RSVP form (Google Form iframe)
│   ├── data/
│   │   └── menuItems.ts     # Menu data
│   └── App.tsx              # Main app component
├── docs/
│   └── (various documentation files)
└── public/
    └── Images/              # Menu and logo images
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment to Google Cloud Run

The app can be deployed to Google Cloud Run for serverless hosting.

**Quick deployment:**
```bash
# Deploy using Cloud Build
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=thanksgiving-app,_REGION=us-central1
```

**Setting up automatic deployments?** See [Cloud Build Trigger Setup](./docs/CLOUD_BUILD_TRIGGER_SETUP.md)

## Features in Detail

### Menu Section
- Displays Thanksgiving dishes grouped by course
- Hover over items to see full ingredient lists and historical context
- Vegetarian-friendly items are marked with a 🌿 icon
- Responsive grid layout

### RSVP Section
- Embedded Google Form for RSVP submissions
- Form submissions are handled directly by Google Forms

## Troubleshooting

### Images not loading
- Ensure images are in `public/Images/` directory
- Check that image paths match the case-sensitive filenames

## License

This project is for personal/educational use.

