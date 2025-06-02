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
    let corsOrigins = ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:8081','http://localhost:2345']; // Default

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

    console.log("sitting up with origins: ", corsOrigins);
    // Middleware
    app.use(express.json());

    // Global request and response logging middleware
    app.use((req, res, next) => {
      const start = Date.now();
      const { method, url, headers, body } = req;
      log(`Incoming Request: ${method} ${url}`)
      // For more detailed logging, uncomment the lines below
      // log('Request Headers:', JSON.stringify(headers, null, 2));
      // if (body && Object.keys(body).length > 0) {
      //   log('Request Body:', JSON.stringify(body, null, 2));
      // }

      const originalSend = res.send;
      res.send = function (responseBody: any) {
        const duration = Date.now() - start;
        log(`Outgoing Response: ${method} ${url} - Status: ${res.statusCode} (${duration}ms)`);
        log('Response Headers:', JSON.stringify(res.getHeaders(), null, 2));
        if (responseBody) {
          try {
            // Attempt to parse if it's a string that might be JSON
            const bodyToLog = (typeof responseBody === 'string' && (responseBody.startsWith('{') || responseBody.startsWith('['))) 
                              ? JSON.parse(responseBody) 
                              : responseBody;
            log('Response Body:', JSON.stringify(bodyToLog, null, 2));
          } catch (e) {
            // If parsing fails or it's not a string, log raw (or truncated for long strings)
            if (typeof responseBody === 'string') {
              log('Response Body (raw/truncated):', responseBody.substring(0, 500) + (responseBody.length > 500 ? '...' : ''));
            } else {
              log('Response Body (non-string):', responseBody);
            }
          }
        }
        return originalSend.apply(res, [responseBody]);
      };

      next();
    });

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
    app.use('/api/traces', createTraceRouter());
    app.use('/api', createProjectRouter()); // Mount again for metadata routes

    // Error handling middleware
    app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      log(`Server Error: ${req.method} ${req.url} - ${error.message}`, error.stack);
      // For more detailed error logging, you can log the full error object:
      // log('Full Server Error Object:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
      } else {
        // If headers already sent, delegate to the default Express error handler
        next(error);
      }
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