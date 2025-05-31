export * from './logger.js';
export * from './transports/index.js';
export * from './initialize.js';
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