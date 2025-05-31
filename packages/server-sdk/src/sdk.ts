import { HttpClient, type SDKConfig } from './client.js';
import { ProjectsModule } from './modules/projects.js';
import { LogsModule } from './modules/logs.js';
import { TracesModule } from './modules/traces.js';
import { ConfigModule } from './modules/config.js';
import { ServerModule } from './modules/server.js';

/**
 * One Logger Server SDK
 * 
 * Provides a unified interface to interact with all One Logger server API endpoints.
 * 
 * @example
 * ```typescript
 * import { OneLoggerSDK } from '@one-logger/server-sdk';
 * 
 * const sdk = new OneLoggerSDK({
 *   baseUrl: 'http://localhost:3000',
 *   apiKey: 'your-api-key' // optional
 * });
 * 
 * // Use the SDK
 * const projects = await sdk.projects.getAll();
 * const logs = await sdk.logs.getAll();
 * const traces = await sdk.traces.getByProjectId('project-id');
 * ```
 */
export class OneLoggerSDK {
  private client: HttpClient;
  
  public readonly projects: ProjectsModule;
  public readonly logs: LogsModule;
  public readonly traces: TracesModule;
  public readonly config: ConfigModule;
  public readonly server: ServerModule;

  constructor(config: SDKConfig) {
    this.client = new HttpClient(config);
    
    // Initialize all modules
    this.projects = new ProjectsModule(this.client);
    this.logs = new LogsModule(this.client);
    this.traces = new TracesModule(this.client);
    this.config = new ConfigModule(this.client);
    this.server = new ServerModule(this.client);
  }

  /**
   * Get the underlying HTTP client for custom requests
   */
  getClient(): HttpClient {
    return this.client;
  }
}