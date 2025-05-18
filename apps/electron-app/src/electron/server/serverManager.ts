import { startProjectServer } from "../server.js";
import { ConfigRepository } from "../repositories/configRepository.js";

import { type ServerType } from '@hono/node-server';
// Custom console logger that captures logs for the server
class ServerLogger {
  private original: typeof console;
  private logs = {
    stdout: [] as string[],
    stderr: [] as string[],
    maxLogLines: 1000, // Maximum number of log lines to keep
  };
  
  constructor() {
    this.original = { ...console };
  }
  
  log(...args: any[]) {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    this.logs.stdout.push(`[${new Date().toISOString()}] ${message}`);
    
    // Trim if exceeds max lines
    if (this.logs.stdout.length > this.logs.maxLogLines) {
      this.logs.stdout = this.logs.stdout.slice(-this.logs.maxLogLines);
    }
    
    // Call original console.log
    this.original.log(...args);
  }
  
  error(...args: any[]) {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    this.logs.stderr.push(`[${new Date().toISOString()}] ${message}`);
    
    // Trim if exceeds max lines
    if (this.logs.stderr.length > this.logs.maxLogLines) {
      this.logs.stderr = this.logs.stderr.slice(-this.logs.maxLogLines);
    }
    
    // Call original console.error
    this.original.error(...args);
  }
  
  // Get logs by type
  getLogs(type: 'stdout' | 'stderr' | 'all') {
    if (type === 'stdout') return this.logs.stdout;
    if (type === 'stderr') return this.logs.stderr;
    return {
      stdout: this.logs.stdout,
      stderr: this.logs.stderr
    };
  }
  
  // Clear logs by type
  clearLogs(type: 'stdout' | 'stderr' | 'all'): boolean {
    if (type === 'stdout' || type === 'all') this.logs.stdout = [];
    if (type === 'stderr' || type === 'all') this.logs.stderr = [];
    return true;
  }
}

// Create a server-specific logger
const serverLogger = new ServerLogger();

export class ServerManager {
  private static instance: ServerManager;
  private serverInstance: ServerType | null = null; // Track the server instance
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
      console.error('Failed to start server:', error);
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
      return { success: false };
    } catch (error) {
      console.error('Failed to stop server:', error);
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
      console.error('Failed to restart server:', error);
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