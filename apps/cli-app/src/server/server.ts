import express from 'express';
import cors from 'cors';
import { ConfigRepository } from '../repositories/configRepository.js';

// Import routers
import { createProjectRouter } from './routes/projectRoutes.js';
import { createLogRouter } from './routes/logRoutes.js';
import { createConfigRouter } from './routes/configRoutes.js';
import { createServerRouter } from './routes/serverRoutes.js';




export async function startProjectServer(logger?: { log: (...args: unknown[]) => void, error: (...args: unknown[]) => void }) {
  try {
    // Use custom logger if provided, otherwise use console
    const log = logger?.log || console.log;

    // Create Express app
    const app = express();

    // Use ConfigRepository for config access
    const configRepo = new ConfigRepository();

    // Check if server is enabled - default to true if not set
    const enabledConfig = await configRepo.getValue('server.enabled');
    const isEnabled = enabledConfig !== 'false'; // Default to true if not set

    if (!isEnabled) {
      log('Project API server is disabled in settings');
      return null;
    }

    // Get CORS configuration
    const corsConfig = await configRepo.getValue('server.corsOrigins');
    let corsOrigins = ['http://localhost:5173', 'http://localhost:3000']; // Default

    if (corsConfig) {
      try {
        const parsedOrigins = JSON.parse(corsConfig);
        if (Array.isArray(parsedOrigins) && parsedOrigins.length > 0) {
          corsOrigins = parsedOrigins;
        }
      } catch (err) {
        console.error('Error parsing CORS origins:', err);
      }
    }

    // Middleware
    app.use(express.json());
    app.use(cors({
      origin: corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }));

    // Mount routers
    app.use('/api/projects', createProjectRouter());
    app.use('/api/logs', createLogRouter());
    app.use('/api/config', createConfigRouter());
    app.use('/api/server', createServerRouter());
    app.use('/api', createProjectRouter()); // Mount again for metadata routes

    // Error handling middleware
    app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });

    // Get port from config or use default
    const port = await configRepo.getValue('server.port') || 3001;
    
    log(`Starting server on port ${port}`);
    
    const server = app.listen(Number(port), () => {
      log(`Server running on http://localhost:${port}`);
    });
    
    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    throw err;
  }
}