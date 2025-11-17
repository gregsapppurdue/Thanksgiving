// Service for RSVP management using Google Sheets backend
// The API endpoint URL should be set in environment variables

export interface RsvpData {
  name: string;
  email?: string;
  phone?: string;
  item: string;
  dietaryRestrictions?: string;
}

export interface Rsvp {
  id: string;
  name: string;
  email: string;
  phone?: string;
  item: string;
  dietaryRestrictions?: string;
  submittedAt: string;
}

// Get API endpoint from environment variable or use a default
const API_ENDPOINT = import.meta.env.VITE_RSVP_API_URL || '';

// Log the API endpoint status (always log in production for debugging)
console.log('RSVP API Endpoint:', API_ENDPOINT || 'NOT CONFIGURED');
if (!API_ENDPOINT) {
  console.error('⚠️ CRITICAL: VITE_RSVP_API_URL is not configured! RSVP submissions will fail.');
}

/**
 * Fetch all RSVPs from Google Sheets API
 * @returns {Promise<Array>} Array of RSVP objects
 */
export const fetchRsvps = async (): Promise<Rsvp[]> => {
  if (!API_ENDPOINT) {
    const errorMsg = 'RSVP API endpoint is not configured. Please contact the administrator.';
    console.error('❌', errorMsg);
    console.error('Make sure VITE_RSVP_API_URL is set during the build process.');
    throw new Error(errorMsg);
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

    const result = await response.json() as { success: boolean; data?: Rsvp[]; error?: string };
    console.log('RSVP data received:', result);
    
    if (result.success) {
      return result.data || [];
    } else {
      throw new Error(result.error || 'Failed to fetch RSVPs');
    }
  } catch (error) {
    const err = error as Error;
    console.error('Failed to fetch RSVPs:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      endpoint: API_ENDPOINT
    });
    if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the RSVP server. Please check that the Google Apps Script is deployed and accessible. Check the browser console for more details.');
    }
    throw new Error('Failed to load RSVPs. Please check your connection and try again.');
  }
};

/**
 * Submit a new RSVP to Google Sheets API
 * @param {RsvpData} rsvpData - RSVP data object
 * @returns {Promise<Rsvp>} The created RSVP object
 */
export const submitRsvp = async (rsvpData: RsvpData): Promise<Rsvp> => {
  // Validate required fields
  if (!rsvpData.name || !rsvpData.item) {
    throw new Error('Name and item are required');
  }

  if (!API_ENDPOINT) {
    const errorMsg = 'RSVP API endpoint is not configured. Your RSVP cannot be saved. Please contact the administrator.';
    console.error('❌', errorMsg);
    console.error('Make sure VITE_RSVP_API_URL is set during the build process.');
    throw new Error(errorMsg);
  }

  try {
    console.log('📤 Submitting RSVP to:', API_ENDPOINT);
    console.log('📤 RSVP data:', JSON.stringify(rsvpData, null, 2));
    
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

    console.log('📥 Response status:', response.status, response.statusText);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('❌ Response error text:', errorText);
      let errorData: { error?: string } = {};
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || `HTTP error! status: ${response.status}` };
      }
      console.error('❌ Response error:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    console.log('📥 Response text:', responseText);
    
    let result: { success: boolean; data?: Rsvp; error?: string };
    try {
      result = JSON.parse(responseText) as { success: boolean; data?: Rsvp; error?: string };
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      console.error('❌ Raw response:', responseText);
      throw new Error('Invalid response from server. Please try again.');
    }
    
    console.log('✅ RSVP submission result:', result);
    
    if (result.success && result.data) {
      console.log('✅ RSVP successfully saved:', result.data);
      return result.data;
    } else {
      const errorMsg = result.error || 'Failed to submit RSVP';
      console.error('❌ RSVP submission failed:', errorMsg);
      throw new Error(errorMsg);
    }
  } catch (error) {
    const err = error as Error;
    console.error('Failed to submit RSVP:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      endpoint: API_ENDPOINT
    });
    if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the RSVP server. Please check that the Google Apps Script is deployed and accessible. Check the browser console for more details.');
    }
    throw new Error(err.message || 'Failed to submit RSVP. Please check your connection and try again.');
  }
};

/**
 * Delete an RSVP (for future use)
 * @param {string} id - The RSVP ID to delete
 * @returns {Promise<void>}
 */
export const deleteRsvp = async (_id: string): Promise<void> => {
  // This would require a DELETE endpoint in the Google Apps Script
  // For now, this is a placeholder
  console.warn('Delete RSVP functionality not yet implemented in Google Sheets backend');
  return Promise.resolve();
};

