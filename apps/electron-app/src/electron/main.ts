import { app, BrowserWindow } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";
import { db } from "./db/db.js";
import { registerIpcHandlers } from "./ipc/index.js";
import { ServerManager } from "./server/serverManager.js";

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
    
    // Start the server using the server manager
    const serverManager = ServerManager.getInstance();
    await serverManager.startServer();
    
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
