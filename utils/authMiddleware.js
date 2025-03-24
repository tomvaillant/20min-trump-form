/**
 * Auth middleware for API routes
 * This handles authentication for API requests
 */

/**
 * Middleware function to check API route authentication
 * This is now handled by middleware.js for UI routes
 * @param {Request} request - The incoming request
 * @returns {boolean} True if authenticated, false otherwise
 */
export function isAuthenticated(request) {
  // API routes might have different authentication needs
  // For now, API routes do not require authentication
  return true;
}

/**
 * Helper function to check if the URL is an API request
 * @param {string} url - Request URL
 * @returns {boolean} True if API request, false otherwise
 */
export function isApiRequest(url) {
  return url.includes('/api/');
}

/**
 * Middleware to handle unauthorized response for API routes
 * @returns {Response} Unauthorized response
 */
export function getUnauthorizedResponse() {
  return new Response('Unauthorized', { 
    status: 401,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}