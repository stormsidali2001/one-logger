export * from './logger.js';
export * from './transports/index.js';

import { Logger } from './logger.js';
import { HttpLoggerTransport } from './transports/http.js';
import { ConsoleLoggerTransport } from './transports/console.js';
import { sdk } from '../sdk.js';

declare global {
  var logger: Logger;
}

if (!globalThis.logger) {
  globalThis.logger = new Logger();
}

export const logger = globalThis.logger;

export interface LoggerInitOptions {
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
}


/**
 * Sets up console transport as fallback
 */
function setupConsoleTransport(projectName: string): void {
  logger.projectId = projectName;
  logger.transport = new ConsoleLoggerTransport();
}

/**
 * Attempts to find an existing project or create a new one
 */
async function getOrCreateProject(name: string, description: string): Promise<{ id: string } | null> {
  try {
    const res = await sdk.projects.exists(name);
    
    if (res.exists && res.project) {
      console.log(`Found existing project "${name}" with server ID ${res.project.id}`);
      return res.project;
    }
    
    // Project doesn't exist, create it
    const newProject = await sdk.projects.create({ name, description });
    console.log(`Created new project "${name}" with server ID ${newProject.id}`);
    return newProject;
    
  } catch (error) {
    console.warn(`[logs-collector] Failed to get or create project: ${String(error)}`);
    return null;
  }
}

/**
 * Sets up HTTP transport with the given project and endpoint
 */
function setupHttpTransport(project: { id: string }): void {
  logger.projectId = project.id;
  logger.transport = new HttpLoggerTransport();
}

/**
 * Logs fallback warning messages
 */
function logFallbackWarning(error?: unknown): void {
  if (error) {
    console.warn(
      `[logs-collector] Failed to initialize HTTP logger transport. Falling back to console logging. Error:`,
      error instanceof Error ? error.message : String(error)
    );
  }
  console.info(`[logs-collector] Logs will be printed to console only and will not be sent to the One Logger app.`);
}

/**
 * Initialize the singleton logger with the HTTP transport for the Electron Hono server.
 * Checks if the projectId exists, creates a project if needed, and updates the singleton logger.
 * If any errors occur during initialization, falls back to console transport.
 * In non-development environments (isDev=false), uses console transport directly.
 * @param options Configuration options
 */
export async function initializeLogger(options: LoggerInitOptions): Promise<void> {
  const {
    name,
    description = '',
    isDev = true
  } = options;

  // In non-dev environments, use console transport directly
  if (!isDev) {
    setupConsoleTransport(name);
    console.info(`[logs-collector] Running in non-dev mode. Using console transport only.`);
    return;
  }

  try {
    const project = await getOrCreateProject(name, description);
    
    if (!project) {
      console.warn(`[logs-collector] Could not create or find project "${name}". Using console transport.`);
      setupConsoleTransport(name);
      return;
    }

    setupHttpTransport(project);
  } catch (error) {
    setupConsoleTransport(name);
    logFallbackWarning(error);
  }
}