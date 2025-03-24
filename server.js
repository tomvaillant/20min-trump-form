/**
 * Custom development server
 */
import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const server = await createServer({
    // Base Vite config options
    configFile: path.resolve(__dirname, 'vite.config.js'),
    
    // Server config
    server: {
      middlewareMode: false
    }
  });
  
  await server.listen();
  
  server.printUrls();
  console.log('🚀 Server started successfully');
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});