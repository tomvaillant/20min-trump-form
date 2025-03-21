/**
 * Vercel Edge Middleware for HTTP Basic Authentication
 * 
 * NOTE: This file is only used in production environments.
 * In development, no authentication is required.
 */

// FOR DEMO PURPOSES ONLY - IN PRODUCTION THESE SHOULD BE ENVIRONMENT VARIABLES
const USERNAME = process.env.AUTH_USERNAME || '20-min';
const PASSWORD = process.env.AUTH_PASSWORD || 'trumpets';

/**
 * Middleware function for Vercel Edge
 * @param {Request} request - The request object
 * @returns {Response|undefined} Response or undefined to pass through
 */
export default function middleware(request) {
  // Skip auth for API routes
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  
  // Skip auth for development environment
  if (process.env.NODE_ENV === 'development') {
    return;
  }
  
  // Get auth header
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    // No auth header, send 401 Unauthorized
    return new Response('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Trump Timeline Form", charset="UTF-8"'
      }
    });
  }
  
  // Verify credentials
  try {
    const base64Credentials = authHeader.substring(6); // Remove 'Basic '
    
    // Parse credentials with support for both Node.js and browser environments
    let credentials;
    if (typeof Buffer !== 'undefined') {
      // Node.js environment
      credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    } else {
      // Browser environment
      credentials = atob(base64Credentials);
    }
    
    const [username, password] = credentials.split(':');
    
    if (username === USERNAME && password === PASSWORD) {
      // Auth successful, continue to app
      return;
    }
    
    // Invalid credentials
    return new Response('Invalid credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Trump Timeline Form", charset="UTF-8"'
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return new Response('Server error during authentication', { status: 500 });
  }
}

/**
 * Define which routes this middleware applies to
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};