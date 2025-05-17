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
}

/**
 * Initialize a Logger with the HTTP transport for the Electron Hono server.
 * Checks if the projectId exists, creates a project if needed, and returns a configured Logger.
 * @param options Configuration options
 */
export async function initializeLogger(options: LoggerInitOptions): Promise<Logger> {
  const {
    name,
    description = '',
    endpoint = 'http://127.0.0.1:5173',
  } = options;

  const projectClient = new ProjectClient(endpoint);
  let project = await projectClient.getByName(name);
  if (!project) {
    project = await projectClient.create({ name, description });
    console.log(`Created new project "${name}" with server ID ${project.id}`);
  } else {
    console.log(`Found existing project "${name}" with server ID ${project.id}`);
  }

  return new Logger({
    projectId: project.id,
    transport: new HttpLoggerTransport(`${endpoint}/api/logs`),
  });
} 