/**
 * Vercel Edge Middleware - Placeholder
 * 
 * This middleware no longer performs HTTP authentication
 */

export default function middleware(request) {
  // No-op middleware to allow all requests
  return;
}

/**
 * Define which routes this middleware applies to
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};