/**
 * Vercel Edge Middleware for HTTP Basic Authentication
 */

// Hardcoded credentials
const VALID_USERNAME = '20-min';
const VALID_PASSWORD = 'trumpets';

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
  
  // Get auth header
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    // No auth header, send 401 Unauthorized
    return new Response(null, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Trump Timeline Form", charset="UTF-8"'
      }
    });
  }
  
  // Verify credentials
  try {
    const base64Credentials = authHeader.substring(6); // Remove 'Basic '
    
    // Use TextDecoder instead of atob for better compatibility
    let credentials;
    if (typeof Buffer !== 'undefined') {
      // Node.js environment
      credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    } else {
      // Edge runtime environment
      const decoded = atob(base64Credentials);
      credentials = decoded;
    }
    
    const [username, password] = credentials.split(':');
    
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      // Auth successful, continue to app
      return;
    }
    
    // Invalid credentials
    return new Response(null, {
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