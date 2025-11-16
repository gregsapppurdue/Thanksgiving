// Service abstraction for RSVP management
// This can be easily swapped out for API calls in the future

let rsvps = [];

/**
 * Fetch all RSVPs
 * In the future, this will make an API call: GET /api/rsvps
 */
export const fetchRsvps = async () => {
  // Simulate async operation
  return Promise.resolve([...rsvps]);
};

/**
 * Submit a new RSVP
 * In the future, this will make an API call: POST /api/rsvps
 * @param {Object} rsvpData - { name: string, email?: string, item: string }
 */
export const submitRsvp = async (rsvpData) => {
  // Validate required fields
  if (!rsvpData.name || !rsvpData.item) {
    throw new Error('Name and item are required');
  }

  // Create new RSVP object
  const newRsvp = {
    id: Date.now().toString(), // In production, this would come from the backend
    name: rsvpData.name.trim(),
    email: rsvpData.email?.trim() || '',
    item: rsvpData.item.trim(),
    submittedAt: new Date().toISOString(),
  };

  // Add to local array (in production, this would be handled by the backend)
  rsvps.push(newRsvp);

  // Simulate async operation
  return Promise.resolve(newRsvp);
};

/**
 * Delete an RSVP (for future use)
 * In the future, this will make an API call: DELETE /api/rsvps/:id
 */
export const deleteRsvp = async (id) => {
  rsvps = rsvps.filter(rsvp => rsvp.id !== id);
  return Promise.resolve();
};

