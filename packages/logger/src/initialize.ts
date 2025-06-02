import { initializeTracing } from './tracing/index.js';
import { HttpTraceTransport } from './tracing/transports/http.js';
import { ConsoleTraceTransport } from './tracing/transports/console.js';
import type { TracingOptions } from './tracing/index.js';
import { LoggerInitOptions, initializeLogger, logger } from './logger/index.js';


interface OneLoggerInitOptions {
  /**
   * Project name to use if creating a new project
   */
  name: string;

  /**
   * Optional project description
   */
  description?: string;

  /**
   * If true, will throw an error when attempting to create a project with a name that's already taken.
   * If false (default), will reuse the existing project with the same name.
   */
  failOnDuplicateName?: boolean;

  /**
   * If true (default), will attempt to connect to the One Logger app.
   * If false, will use console transport directly without attempting to connect.
   * Set to false in production environments.
   */
  isDev?: boolean;

  /**
   * Tracer configuration (optional)
   */
  tracer?: {
    /**
     * Batch size for trace collection. Defaults to 10.
     */
    batchSize?: number;
    
    /**
     * Flush interval in milliseconds. Defaults to 5000.
     */
    flushInterval?: number;
    
    /**
     * If true, will use HTTP transport for traces. If false, uses console transport.
     * Defaults to the same value as isDev.
     */
    useHttpTransport?: boolean;
    
    /**
     * Optional custom context adapter for async context handling.
     * If not provided, the default adapter will be used (Node.js AsyncLocalStorage or browser fallback).
     */
    contextAdapter?: import('./tracing/context-adapter.js').ContextAdapter;
  };
}

// Logger-related logic has been moved to ./logger/initialize.ts

/**
 * Initialize both logger and tracer in one unified function.
 * This is the recommended way to initialize One Logger with both logging and tracing capabilities.
 * @param options Configuration options for both logger and tracer
 */
export async function initializeOneLogger(options: OneLoggerInitOptions): Promise<void> {
  const { name, description, failOnDuplicateName, isDev, tracer: tracerOptions } = options;
  
  // Create logger options from top-level properties
  const loggerOptions: LoggerInitOptions = {
    name,
    description,
    failOnDuplicateName,
    isDev
  };
  
  // Initialize logger first
  await initializeLogger(loggerOptions);
  
  // Initialize tracer if options are provided
  if (tracerOptions) {
    const {
      batchSize = 10,
      flushInterval = 5000,
      useHttpTransport = isDev ?? true,
      contextAdapter
    } = tracerOptions;
    
    // Determine transport based on configuration
    let transport;
    if (useHttpTransport && isDev !== false) {
      // Use HTTP transport if in dev mode and project is available
      if (logger.projectId) {
        transport = new HttpTraceTransport(logger.projectId);
      } else {
        // Fallback to console if no project ID available
        transport = new ConsoleTraceTransport();
        console.warn('[one-logger] No project ID available for HTTP trace transport. Using console transport.');
      }
    } else {
      // Use console transport for non-dev environments
      transport = new ConsoleTraceTransport();
    }
    
    const tracingOptions: TracingOptions = {
      transport,
      batchSize,
      flushInterval,
      contextAdapter
    };
    
    initializeTracing(tracingOptions);
    console.info('[one-logger] Tracing initialized successfully.');
  }
}