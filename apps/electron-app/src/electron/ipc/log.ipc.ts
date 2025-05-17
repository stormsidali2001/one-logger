import { ipcMain } from 'electron';
import { LogRepository } from '../db/logRepository.js';
import { Log } from '../../types/log.js';

const repo = new LogRepository();

export function registerLogHandlers() {
  ipcMain.handle('logs:create', async (_event, data: Omit<Log, 'id'>) => {
    return repo.createLog(data);
  });

  ipcMain.handle('logs:getById', async (_event, id: string) => {
    return repo.getLogById(id);
  });

  ipcMain.handle('logs:getByProjectId', async (_event, projectId: string) => {
    return repo.getLogsByProjectId(projectId);
  });

  ipcMain.handle('logs:getAll', async () => {
    return repo.getAllLogs();
  });
} 