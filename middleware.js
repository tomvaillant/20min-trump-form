/**
 * Vercel Edge Middleware for Basic HTTP Authentication
 */

// Export a named middleware function instead of default
export function middleware(request) {
  // Get auth credentials from request
  const basicAuth = request.headers.get('authorization');

  // Get environment variables
  const username = process.env.AUTH_USERNAME;
  const password = process.env.AUTH_PASSWORD;

  // Check if auth is properly configured
  if (!username || !password) {
    console.warn('Auth credentials not configured in environment variables');
    return;
  }
  
  // Debug log - will appear in Vercel logs
  console.log('Authentication middleware is active');

  // Verify auth credentials
  if (!basicAuth) {
    return new Response('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"'
      }
    });
  }

  // Decode and verify credentials
  const [authType, authValue] = basicAuth.split(' ');
  if (authType.toLowerCase() !== 'basic') {
    return getUnauthorizedResponse();
  }

  const decoded = atob(authValue);
  const [providedUsername, providedPassword] = decoded.split(':');

  if (providedUsername !== username || providedPassword !== password) {
    return getUnauthorizedResponse();
  }

  // Authentication successful
  return;
}

/**
 * Return unauthorized response
 */
function getUnauthorizedResponse() {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"'
    }
  });
}

/**
 * Define which routes this middleware applies to
 * - Apply to all routes except API routes and static files
 * - This ensures auth is triggered on page load, not just API calls
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets).*)'],
};