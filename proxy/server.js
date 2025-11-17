/**
 * CORS Proxy for Google Apps Script RSVP API
 * 
 * This service acts as a proxy between the React frontend and Google Apps Script,
 * handling CORS headers and forwarding requests server-to-server.
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || '';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

// Validate required environment variable
if (!APPS_SCRIPT_URL) {
  console.error('ERROR: APPS_SCRIPT_URL environment variable is not set');
  process.exit(1);
}

console.log('Proxy server starting...');
console.log('APPS_SCRIPT_URL:', APPS_SCRIPT_URL);
console.log('ALLOWED_ORIGIN:', ALLOWED_ORIGIN);
console.log('PORT:', PORT);

// Middleware
app.use(express.text({ type: '*/*' })); // Accept any content type and preserve as text
app.use(express.json()); // Also support JSON parsing
app.use(cors({
  origin: ALLOWED_ORIGIN === '*' ? true : ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400 // 24 hours
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'rsvp-cors-proxy' });
});

/**
 * Proxy endpoint for RSVP API
 * Handles GET, POST, and OPTIONS requests
 */
app.all('/api/rsvp', async (req, res) => {
  const method = req.method;
  const startTime = Date.now();

  // Log request (without sensitive data)
  console.log(`[${new Date().toISOString()}] ${method} /api/rsvp`);

  // Handle OPTIONS preflight request
  if (method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return res.status(200).end();
  }

  try {
    // Prepare request to Apps Script
    const requestOptions = {
      method: method,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Apps Script expects this
      },
    };

    // Add body for POST requests
    if (method === 'POST' && req.body) {
      // If body is already a string (from text parser), use it directly
      // Otherwise stringify if it's an object
      if (typeof req.body === 'string') {
        requestOptions.body = req.body;
      } else {
        requestOptions.body = JSON.stringify(req.body);
      }
    }

    // Forward request to Apps Script
    console.log(`Forwarding ${method} request to Apps Script: ${APPS_SCRIPT_URL}`);
    const response = await fetch(APPS_SCRIPT_URL, requestOptions);

    const duration = Date.now() - startTime;
    console.log(`Apps Script response: ${response.status} (${duration}ms)`);

    // Get response text
    const responseText = await response.text();
    
    // Parse JSON response
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Apps Script response as JSON:', parseError);
      console.error('Raw response:', responseText);
      return res.status(502).json({
        success: false,
        error: 'Invalid response from Apps Script: not valid JSON'
      });
    }

    // Forward status code and response
    res.status(response.status).json(responseData);

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Error forwarding request (${duration}ms):`, error);

    // Handle different error types
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return res.status(504).json({
        success: false,
        error: 'Gateway timeout: Apps Script did not respond in time'
      });
    }

    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      return res.status(502).json({
        success: false,
        error: 'Bad gateway: Unable to connect to Apps Script'
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      error: `Proxy error: ${error.message}`
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`CORS Proxy server running on port ${PORT}`);
  console.log(`Proxying requests to: ${APPS_SCRIPT_URL}`);
});

