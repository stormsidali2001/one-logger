import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";
import { db } from "./db/db.js";
import { registerIpcHandlers } from "./ipc/index.js";
import { startProjectServer } from "./server.js";

// Store server logs
const serverLogs = {
  stdout: [] as string[],
  stderr: [] as string[],
  maxLogLines: 1000, // Maximum number of log lines to keep
};

// Custom console logger that captures logs for the server
class ServerLogger {
  private original: typeof console;
  
  constructor() {
    this.original = { ...console };
  }
  
  log(...args: any[]) {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    serverLogs.stdout.push(`[${new Date().toISOString()}] ${message}`);
    
    // Trim if exceeds max lines
    if (serverLogs.stdout.length > serverLogs.maxLogLines) {
      serverLogs.stdout = serverLogs.stdout.slice(-serverLogs.maxLogLines);
    }
    
    // Call original console.log
    this.original.log(...args);
  }
  
  error(...args: any[]) {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    serverLogs.stderr.push(`[${new Date().toISOString()}] ${message}`);
    
    // Trim if exceeds max lines
    if (serverLogs.stderr.length > serverLogs.maxLogLines) {
      serverLogs.stderr = serverLogs.stderr.slice(-serverLogs.maxLogLines);
    }
    
    // Call original console.error
    this.original.error(...args);
  }
}

// Create a server-specific logger
const serverLogger = new ServerLogger();

let serverInstance: ReturnType<typeof setTimeout> | null = null;

// Initialize database when app is ready
app.whenReady().then(async () => {
  // Initialize the database
  try {
    await db.init();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Log more detailed error information
    console.error('Error details:', error instanceof Error ? error.stack : String(error));
    // Don't stop app startup, continue with IPC registration
  }
  
  // Register IPC handlers - do this regardless of DB initialization success
  try {
    registerIpcHandlers();
    console.log('IPC handlers registered successfully');
    
    // Start the project server
    await startProjectServer({
      log: serverLogger.log.bind(serverLogger),
      error: serverLogger.error.bind(serverLogger)
    });
    
    // Handler to restart the server
    ipcMain.handle('server:restart', async () => {
      console.log('Restarting server due to configuration change');
      // In a real implementation, we'd properly shut down the existing server
      // For this example, we just restart it
      await startProjectServer({
        log: serverLogger.log.bind(serverLogger),
        error: serverLogger.error.bind(serverLogger)
      });
      return { success: true };
    });
    
    // Handler to get server logs
    ipcMain.handle('server:getLogs', async (_, type: 'stdout' | 'stderr' | 'all') => {
      if (type === 'stdout') return serverLogs.stdout;
      if (type === 'stderr') return serverLogs.stderr;
      return {
        stdout: serverLogs.stdout,
        stderr: serverLogs.stderr
      };
    });
    
    // Handler to clear server logs
    ipcMain.handle('server:clearLogs', async (_, type: 'stdout' | 'stderr' | 'all') => {
      if (type === 'stdout' || type === 'all') serverLogs.stdout = [];
      if (type === 'stderr' || type === 'all') serverLogs.stderr = [];
      return true;
    });
    
  } catch (error) {
    // This is critical - log detailed error
    console.error('Failed to register IPC handlers:', error);
    console.error('Error details:', error instanceof Error ? error.stack : String(error));
  }
});

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    webPreferences: {
      preload: getPreloadPath(),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  if (isDev()) {
    mainWindow.loadURL("http://localhost:5000");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }
});

// Close database connection when app is about to quit
app.on("will-quit", async () => {
  await db.close();
});
