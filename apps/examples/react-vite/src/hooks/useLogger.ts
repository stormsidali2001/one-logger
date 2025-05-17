import { useState, useEffect } from 'react';
import { initializeLogger, Logger } from 'logger/src';

interface LoggerConfig {
  name: string;
  description: string;
  endpoint: string;
}

export function useLogger(config: LoggerConfig) {
  const [logger, setLogger] = useState<Logger | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setup() {
      try {
        setLoading(true);
        // Initialize the logger
        const loggerInstance = await initializeLogger({
          name: config.name,
          description: config.description,
          endpoint: config.endpoint
        });
        setLogger(loggerInstance);
        
        // Log that the app has started
        await loggerInstance.info('Application started', {
          environment: process.env.NODE_ENV || 'development',
          timestamp: new Date().toISOString(),
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize logger:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize logger');
        setLoading(false);
      }
    }
    
    setup();
    
    return () => {
      // Log that the component is unmounting
      if (logger) {
        logger.info('Application stopping').catch(console.error);
      }
    };
  }, [config.name, config.description, config.endpoint]);

  return { logger, loading, error };
} 