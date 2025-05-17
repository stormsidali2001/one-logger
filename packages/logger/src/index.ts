export * from './logger';
export * from './types';
export { HttpLoggerTransport } from './transports/http';
export { initializeLogger } from './initialize'; // now async, returns Promise<Logger> 