import { initializeOneLogger, logger } from '@notjustcoders/one-logger-client-sdk';

// Initialize One Logger with both logging and tracing
logger.info('🚀 Starting One Logger initialization...');
initializeOneLogger({
  name: 'vite-example-app',
  description: 'Example Vite React app with One Logger tracing',
  isDev: true, // Use console transport for development
  tracer: {
    batchSize: 1, // Flush traces immediately for demo
    flushInterval: 5000, // Flush every second
    useHttpTransport: false  // Use console transport
  }
});

logger.info('✅ One Logger initialized successfully!', {
  appName: 'vite-example-app',
  features: ['logging', 'tracing'],
  environment: 'development'
});

export { logger };