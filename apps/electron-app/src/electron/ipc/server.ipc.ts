import { ipcMain } from "electron";
import { ServerManager } from "../server/serverManager.js";
import { RestartServer } from '../use-cases/restartServer.js';
import { StopServer } from '../use-cases/stopServer.js';
import { GetServerLogs } from '../use-cases/getServerLogs.js';
import { ClearServerLogs } from '../use-cases/clearServerLogs.js';

export function registerServerHandlers(): void {
  const serverManager = ServerManager.getInstance();
  const restartServer = new RestartServer(serverManager);
  const stopServer = new StopServer(serverManager);
  const getServerLogs = new GetServerLogs(serverManager);
  const clearServerLogs = new ClearServerLogs(serverManager);

  // Handler to restart the server
  ipcMain.handle('server:restart', async () => {
    return await restartServer.execute();
  });

  // Handler to stop the server
  ipcMain.handle('server:stop', async () => {
    return await stopServer.execute();
  });

  // Handler to get server logs
  ipcMain.handle('server:getLogs', async (_, type: 'stdout' | 'stderr' | 'all') => {
    return getServerLogs.execute(type);
  });

  // Handler to clear server logs
  ipcMain.handle('server:clearLogs', async (_, type: 'stdout' | 'stderr' | 'all') => {
    return clearServerLogs.execute(type);
  });
}