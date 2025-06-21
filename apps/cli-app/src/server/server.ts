import express from 'express';
import cors from 'cors';
import { ConfigRepository } from '../repositories/configRepository.js';

// Import routers
import { createProjectRouter } from './routes/projectRoutes.js';
import { createLogRouter } from './routes/logRoutes.js';
import { createConfigRouter } from './routes/configRoutes.js';
import { createServerRouter } from './routes/serverRoutes.js';
import { createTraceRouter } from './routes/traceRoutes.js';




export async function startProjectServer(logger?: { log: (...args: unknown[]) => void, error: (...args: unknown[]) => void }) {
  try {
    // Use custom logger if provided, otherwise use console
    const log = logger?.log || console.log;
    const error = logger?.error || console.error;

    // Set up global error handlers to prevent server crashes
    process.on('uncaughtException', (err) => {
      error('Uncaught Exception:', err);
      // Don't exit the process, just log the error
    });

    process.on('unhandledRejection', (reason, promise) => {
      error('Unhandled Rejection at:', promise, 'reason:', reason);
      // Don't exit the process, just log the error
    });

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

    // Get CORS configuration from database
    const corsConfig = await configRepo.getValue('server.corsOrigins');
    let corsOrigins: string[] = [];

    if (corsConfig) {
      try {
        const parsedOrigins = JSON.parse(corsConfig);
        if (Array.isArray(parsedOrigins) && parsedOrigins.length > 0) {
          corsOrigins = parsedOrigins;
        }
      } catch (err) {
        error('Error parsing CORS origins:', err);
        // Fallback to empty array if parsing fails
        corsOrigins = [];
      }
    }

    // If no CORS config found, log warning
    if (corsOrigins.length === 0) {
      error('No CORS origins configured. Server may not accept requests from web clients.');
    }

    console.log("sitting up with origins: ", corsOrigins);
    // Middleware
    app.use(express.json({limit:"50mb"}));

    app.use(cors({
      origin: corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }));

    // Mount routers with top-level try-catch for each route
    try {
      app.use('/api/projects', createProjectRouter());
      app.use('/api/logs', createLogRouter());
      app.use('/api/config', createConfigRouter());
      app.use('/api/server', createServerRouter());
      app.use('/api/traces', createTraceRouter());
      app.use('/api', createProjectRouter()); // Mount again for metadata routes
    } catch (routeError) {
      error('Error mounting routes:', routeError);
      throw routeError;
    }

    // Error handling middleware
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        log(`Server Error: ${req.method} ${req.url} - ${err.message}`, err.stack);
        // For more detailed error logging, you can log the full error object:
        // log('Full Server Error Object:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error', message: err.message });
        } else {
          // If headers already sent, delegate to the default Express error handler
          next(err);
        }
      } catch (middlewareError) {
        error('Error in error handling middleware:', middlewareError);
        // Fallback error response
        if (!res.headersSent) {
          res.status(500).json({ error: 'Critical server error' });
        }
      }
    });

    // Get port from config or use default
    const port = await configRepo.getValue('server.port') || 3001;
    
    log(`Starting server on port ${port}`);
    
    const server = app.listen(Number(port), () => {
      log(`Server running on http://localhost:${port}`);
    });
    
    // Handle server errors
    server.on('error', (serverError) => {
      error('Server error:', serverError);
    });
    
    return server;
  } catch (err) {
    const errorLogger = logger?.error || console.error;
    errorLogger('Failed to start server:', err);
    throw err;
  }
}