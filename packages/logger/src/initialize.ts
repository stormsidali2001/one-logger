import { Logger } from './logger';
import { HttpLoggerTransport } from './transports/http';
import { ConsoleLoggerTransport } from './transports/console';
import { ProjectClient } from './projectClient';

interface LoggerInitOptions {
  /**
   * Project name to use if creating a new project
   */
  name: string;
  
  /**
   * Optional project description
   */
  description?: string;
  
  /**
   * The Electron API base URL. Defaults to 'http://127.0.0.1:5173'.
   */
  endpoint?: string;

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

// Singleton logger instance
export const logger = new Logger();

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
    endpoint = 'http://127.0.0.1:5173',
    failOnDuplicateName = false,
    isDev = true
  } = options;

  // In non-dev environments, use console transport directly
  if (!isDev) {
    logger.projectId = name; // Use name as a placeholder project ID
    logger.transport = new ConsoleLoggerTransport();
    console.info(`[logs-collector] Running in non-dev mode. Using console transport only.`);
    return;
  }

  try {
    const projectClient = new ProjectClient(endpoint);
    
    // First, try to get the existing project
    let project;
    try {
      project = await projectClient.getByName(name);
    } catch (initialFetchError) {
      console.warn(`[logs-collector] Failed to initially fetch project: ${String(initialFetchError)}`);
      // Continue with project = undefined
    }
    
    if (!project) {
      // Check if the name is already taken (this can happen in race conditions)
      let isNameTaken = false;
      
      try {
        isNameTaken = await projectClient.isNameTaken(name);
      } catch (nameCheckError) {
        console.warn(`[logs-collector] Failed to check if project name is taken: ${String(nameCheckError)}`);
        // Fall through with isNameTaken = false, we'll try to create the project
      }
      
      if (isNameTaken) {
        if (failOnDuplicateName) {
          // Don't throw, just log and use console transport
          console.warn(`[logs-collector] Project name "${name}" is already taken.`);
          logger.projectId = name;
          logger.transport = new ConsoleLoggerTransport();
          return;
        }
        // Try to get the project again in case it was created between our first check and now
        try {
          project = await projectClient.getByName(name);
          console.log(`Using existing project "${name}" with server ID ${project?.id}`);
        } catch (getProjectError) {
          console.warn(`[logs-collector] Failed to get project by name: ${String(getProjectError)}`);
          logger.projectId = name;
          logger.transport = new ConsoleLoggerTransport();
          return;
        }
      } else {
        // Create a new project since the name isn't taken
        try {
          project = await projectClient.create({ name, description });
          console.log(`Created new project "${name}" with server ID ${project.id}`);
        } catch (createError) {
          console.warn(`[logs-collector] Failed to create project: ${String(createError)}`);
          logger.projectId = name;
          logger.transport = new ConsoleLoggerTransport();
          return;
        }
      }
    } else {
      console.log(`Found existing project "${name}" with server ID ${project.id}`);
    }

    // Ensure we have a project at this point
    if (!project) {
      console.warn(`[logs-collector] Could not create or find project "${name}". Using console transport.`);
      logger.projectId = name;
      logger.transport = new ConsoleLoggerTransport();
      return;
    }

    logger.projectId = project.id;
    logger.transport = new HttpLoggerTransport(`${endpoint}/api/logs`);
  } catch (error) {
    // Fallback to console transport
    logger.projectId = name; // Use name as a placeholder project ID
    logger.transport = new ConsoleLoggerTransport();
    
    // Log warning about the fallback
    console.warn(
      `[logs-collector] Failed to initialize HTTP logger transport. Falling back to console logging. Error:`,
      error instanceof Error ? error.message : String(error)
    );
    console.info(`[logs-collector] Logs will be printed to console only and will not be sent to the One Logger app.`);
  }
} 