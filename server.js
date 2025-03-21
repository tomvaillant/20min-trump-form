/**
 * Custom development server with Basic Authentication
 */
import { createServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Hardcoded credentials
const VALID_USERNAME = '20-min';
const VALID_PASSWORD = 'trumpets';

async function startServer() {
  const server = await createServer({
    // Base Vite config options
    configFile: path.resolve(__dirname, 'vite.config.js'),
    
    // Add custom server middleware for authentication
    server: {
      middlewareMode: false, // Ensures Vite uses our middleware
      
      // Add authentication middleware before all requests
      before: [
        (req, res, next) => {
          // Skip auth for API routes during development
          if (req.url.startsWith('/api/')) {
            return next();
          }
          
          // Get auth header
          const authHeader = req.headers.authorization;
          
          if (!authHeader || !authHeader.startsWith('Basic ')) {
            // No auth header, send 401 Unauthorized
            res.writeHead(401, {
              'WWW-Authenticate': 'Basic realm="Trump Timeline Form", charset="UTF-8"'
            });
            return res.end('Unauthorized');
          }
          
          // Verify credentials
          try {
            const base64Credentials = authHeader.split(' ')[1];
            const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
            const [username, password] = credentials.split(':');
            
            if (username === VALID_USERNAME && password === VALID_PASSWORD) {
              // Auth successful
              return next();
            }
            
            // Invalid credentials
            res.writeHead(401, {
              'WWW-Authenticate': 'Basic realm="Trump Timeline Form", charset="UTF-8"'
            });
            return res.end('Unauthorized: Invalid credentials');
          } catch (error) {
            console.error('Authentication error:', error);
            res.writeHead(500);
            return res.end('Server error during authentication');
          }
        }
      ]
    }
  });
  
  await server.listen();
  
  server.printUrls();
  console.log('🔒 Basic Authentication enabled (Username: 20-min, Password: trumpets)');
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});