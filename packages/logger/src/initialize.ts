import { Logger } from './logger';
import { HttpLoggerTransport } from './transports/http';
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
}

// Singleton logger instance
export const logger = new Logger();

/**
 * Initialize the singleton logger with the HTTP transport for the Electron Hono server.
 * Checks if the projectId exists, creates a project if needed, and updates the singleton logger.
 * @param options Configuration options
 */
export async function initializeLogger(options: LoggerInitOptions): Promise<void> {
  const {
    name,
    description = '',
    endpoint = 'http://127.0.0.1:5173',
    failOnDuplicateName = false
  } = options;

  const projectClient = new ProjectClient(endpoint);
  
  // First, try to get the existing project
  let project = await projectClient.getByName(name);
  
  if (!project) {
    // Check if the name is already taken (this can happen in race conditions)
    const isNameTaken = await projectClient.isNameTaken(name);
    
    if (isNameTaken) {
      if (failOnDuplicateName) {
        throw new Error(`Project name "${name}" is already taken`);
      }
      // Try to get the project again in case it was created between our first check and now
      project = await projectClient.getByName(name);
      console.log(`Using existing project "${name}" with server ID ${project?.id}`);
    } else {
      // Create a new project since the name isn't taken
      project = await projectClient.create({ name, description });
      console.log(`Created new project "${name}" with server ID ${project.id}`);
    }
  } else {
    console.log(`Found existing project "${name}" with server ID ${project.id}`);
  }

  // Ensure we have a project at this point
  if (!project) {
    throw new Error(`Failed to initialize logger: Could not create or find project "${name}"`);
  }

  logger.projectId = project.id;
  logger.transport = new HttpLoggerTransport(`${endpoint}/api/logs`);
} 