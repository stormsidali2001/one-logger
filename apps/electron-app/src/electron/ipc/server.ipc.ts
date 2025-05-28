import { ipcMain } from "electron";
import { ServerManager } from "../server/serverManager.js";

export function registerServerHandlers(): void {
  const serverManager = ServerManager.getInstance();

  // Handler to restart the server
  ipcMain.handle('server:restart', async () => {
    return await serverManager.restartServer();
  });

  // Handler to stop the server
  ipcMain.handle('server:stop', async () => {
    return await serverManager.stopServer();
  });

  // Handler to get server logs
  ipcMain.handle('server:getLogs', async (_, type: 'stdout' | 'stderr' | 'all') => {
    return serverManager.getLogs(type);
  });

  // Handler to clear server logs
  ipcMain.handle('server:clearLogs', async (_, type: 'stdout' | 'stderr' | 'all') => {
    return serverManager.clearLogs(type);
  });
} 