/**
 * HTTP Basic Authentication middleware for the Trump Timeline form
 */

// Hardcoded credentials for simplicity
const VALID_USERNAME = '20-min';
const VALID_PASSWORD = 'trumpets';

/**
 * Decodes the Base64 Authorization header
 * @param {string} authHeader - The Authorization header value
 * @returns {Object} Object with username and password
 */
function decodeAuthHeader(authHeader) {
  try {
    // Remove "Basic " prefix and decode Base64
    const base64Credentials = authHeader.replace('Basic ', '');
    
    // Use Buffer for decoding in Node.js environment
    // or atob in browser environment
    let credentials;
    if (typeof Buffer !== 'undefined') {
      // Node.js environment
      credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    } else {
      // Browser environment
      credentials = atob(base64Credentials);
    }
    
    const [username, password] = credentials.split(':');
    
    return { username, password };
  } catch (error) {
    return { username: null, password: null };
  }
}

/**
 * Middleware function to check authentication
 * @param {Request} req - The request object
 * @returns {boolean} True if authenticated, false otherwise
 */
export function isAuthenticated(req) {
  // Get the Authorization header
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }
  
  // Decode the credentials
  const { username, password } = decodeAuthHeader(authHeader);
  
  // Check if credentials are valid
  return (username === VALID_USERNAME && password === VALID_PASSWORD);
}

/**
 * Middleware to handle authentication response
 * @returns {Response} 401 Unauthorized response
 */
export function getUnauthorizedResponse() {
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Trump Timeline Form", charset="UTF-8"'
    }
  });
}

/**
 * Helper function to check if the URL is an API request
 * @param {string} url - Request URL
 * @returns {boolean} True if API request, false otherwise
 */
export function isApiRequest(url) {
  return url.includes('/api/');
}