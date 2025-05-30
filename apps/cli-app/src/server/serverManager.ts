import { startProjectServer } from "./server.js";
import { ConfigRepository } from "../repositories/configRepository.js";
import { ServerLogger } from './serverLogger.js';

// Create a server-specific logger
const serverLogger = new ServerLogger('APIServer');

export class ServerManager {
  private static instance: ServerManager;
  private serverInstance: any | null = null; 
  private configRepo = new ConfigRepository();
  
  // Private constructor for singleton pattern
  private constructor() {}
  
  // Get singleton instance
  public static getInstance(): ServerManager {
    if (!ServerManager.instance) {
      ServerManager.instance = new ServerManager();
    }
    return ServerManager.instance;
  }
  
  // Start the server
  public async startServer(): Promise<void> {
    try {
      // Check if server is already running
      if (this.serverInstance) {
        serverLogger.log('Server is already running.');
        return;
      }

      // Use ConfigRepository for config access
      const enabledConfig = await this.configRepo.getValue('server.enabled');
      const isEnabled = enabledConfig !== 'false'; // Default to true if not set
      
      if (!isEnabled) {
        serverLogger.log('Server is disabled in settings, not starting');
        return;
      }
      
      this.serverInstance = await startProjectServer({
        log: serverLogger.log.bind(serverLogger),
        error: serverLogger.error.bind(serverLogger)
      });
    } catch (error) {
      serverLogger.error('Failed to start server:', error);
    }
  }
  
  // Stop the server
  public async stopServer(): Promise<{ success: boolean }> {
    try {
      if (this.serverInstance) {
        await new Promise<void>((resolve, reject) => {
          this.serverInstance!.close((err?: Error) => {
            if (err) reject(err);
            else resolve();
          });
        });
        this.serverInstance = null;
        serverLogger.log('Server stopped due to configuration change');
        return { success: true };
      }
      serverLogger.log('Server was not running');
      return { success: false };
    } catch (error) {
      serverLogger.error('Failed to stop server:', error);
      return { success: false };
    }
  }
  
  // Restart the server
  public async restartServer(): Promise<{ success: boolean }> {
    try {
      // First stop the server if it's running
      await this.stopServer();
      
      // Then start it again with new config
      serverLogger.log('Restarting server due to configuration change');
      this.serverInstance = await startProjectServer({
        log: serverLogger.log.bind(serverLogger),
        error: serverLogger.error.bind(serverLogger)
      });
      
      return { success: true };
    } catch (error) {
      serverLogger.error('Failed to restart server:', error);
      return { success: false };
    }
  }
  
  // Get logs by type - exposed for IPC handlers
  public getLogs(type: 'stdout' | 'stderr' | 'all') {
    return serverLogger.getLogs(type);
  }
  
  // Clear logs by type - exposed for IPC handlers
  public clearLogs(type: 'stdout' | 'stderr' | 'all'): boolean {
    return serverLogger.clearLogs(type);
  }
} 