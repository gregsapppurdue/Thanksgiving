// Service for RSVP management using Google Sheets backend
// The API endpoint URL should be set in environment variables

// Get API endpoint from environment variable or use a default
const API_ENDPOINT = import.meta.env.VITE_RSVP_API_URL || '';

// Debug: Log the API endpoint (remove in production)
if (import.meta.env.DEV) {
  console.log('RSVP API Endpoint:', API_ENDPOINT || 'NOT CONFIGURED');
}

/**
 * Fetch all RSVPs from Google Sheets API
 * @returns {Promise<Array>} Array of RSVP objects
 */
export const fetchRsvps = async () => {
  if (!API_ENDPOINT) {
    console.warn('RSVP API endpoint not configured. Using fallback in-memory storage.');
    console.warn('Make sure VITE_RSVP_API_URL is set in your .env file and dev server is restarted.');
    // Fallback to in-memory storage if API is not configured
    return Promise.resolve([]);
  }

  try {
    console.log('Fetching RSVPs from:', API_ENDPOINT);
    // Google Apps Script web apps - try with minimal headers
    const response = await fetch(API_ENDPOINT, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit',
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('RSVP data received:', result);
    
    if (result.success) {
      return result.data || [];
    } else {
      throw new Error(result.error || 'Failed to fetch RSVPs');
    }
  } catch (error) {
    console.error('Failed to fetch RSVPs:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      endpoint: API_ENDPOINT
    });
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the RSVP server. Please check that the Google Apps Script is deployed and accessible. Check the browser console for more details.');
    }
    throw new Error('Failed to load RSVPs. Please check your connection and try again.');
  }
};

/**
 * Submit a new RSVP to Google Sheets API
 * @param {Object} rsvpData - { name: string, email?: string, phone?: string, item: string, dietaryRestrictions?: string }
 * @returns {Promise<Object>} The created RSVP object
 */
export const submitRsvp = async (rsvpData) => {
  // Validate required fields
  if (!rsvpData.name || !rsvpData.item) {
    throw new Error('Name and item are required');
  }

  if (!API_ENDPOINT) {
    console.warn('RSVP API endpoint not configured. Using fallback in-memory storage.');
    // Fallback to in-memory storage if API is not configured
    const newRsvp = {
      id: Date.now().toString(),
      name: rsvpData.name.trim(),
      email: rsvpData.email?.trim() || '',
      phone: rsvpData.phone?.trim() || '',
      item: rsvpData.item.trim(),
      dietaryRestrictions: rsvpData.dietaryRestrictions?.trim() || '',
      submittedAt: new Date().toISOString(),
    };
    return Promise.resolve(newRsvp);
  }

  try {
    console.log('Submitting RSVP to:', API_ENDPOINT);
    console.log('RSVP data:', rsvpData);
    // Use text/plain to avoid CORS preflight (Google Apps Script limitation)
    // The body is still JSON, but the Content-Type avoids the OPTIONS request
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        name: rsvpData.name.trim(),
        email: rsvpData.email?.trim() || '',
        phone: rsvpData.phone?.trim() || '',
        item: rsvpData.item.trim(),
        dietaryRestrictions: rsvpData.dietaryRestrictions?.trim() || '',
      }),
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Response error:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('RSVP submission result:', result);
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to submit RSVP');
    }
  } catch (error) {
    console.error('Failed to submit RSVP:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      endpoint: API_ENDPOINT
    });
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the RSVP server. Please check that the Google Apps Script is deployed and accessible. Check the browser console for more details.');
    }
    throw new Error(error.message || 'Failed to submit RSVP. Please check your connection and try again.');
  }
};

/**
 * Delete an RSVP (for future use)
 * @param {string} id - The RSVP ID to delete
 * @returns {Promise<void>}
 */
export const deleteRsvp = async (id) => {
  // This would require a DELETE endpoint in the Google Apps Script
  // For now, this is a placeholder
  console.warn('Delete RSVP functionality not yet implemented in Google Sheets backend');
  return Promise.resolve();
};
