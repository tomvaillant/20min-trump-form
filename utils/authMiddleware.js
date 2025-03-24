/**
 * Auth middleware - No longer used
 * This file has been emptied as HTTP Basic Auth has been removed
 */

/**
 * Middleware function to check authentication - always returns true
 * @returns {boolean} Always true
 */
export function isAuthenticated() {
  return true;
}

/**
 * Middleware to handle authentication response
 * @returns {Response} 200 OK response
 */
export function getUnauthorizedResponse() {
  return new Response('OK', { status: 200 });
}

/**
 * Helper function to check if the URL is an API request
 * @param {string} url - Request URL
 * @returns {boolean} True if API request, false otherwise
 */
export function isApiRequest(url) {
  return url.includes('/api/');
}