import { ipcMain } from 'electron';
import { LogRepository } from '../repositories/logRepository.js';
import { Log, LogFilters } from '../../types/log.js';

const repo = new LogRepository();

export function registerLogHandlers() {
  ipcMain.handle('logs:create', async (_event, data: Omit<Log, 'id'>) => {
    return repo.createLog(data);
  });

  ipcMain.handle('logs:getById', async (_event, id: string) => {
    return repo.getLogById(id);
  });

  ipcMain.handle('logs:getByProjectId', async (_event, projectId: string, 
    options?: { limit?: number; cursor?: { id: string; timestamp: string }; sortDirection?: 'asc' | 'desc' }) => {
    return repo.getLogsWithFilters({ 
      projectId, 
      ...options 
    });
  });

  ipcMain.handle('logs:getFiltered', async (_event, filters: LogFilters) => {
    return repo.getLogsWithFilters(filters);
  });

  ipcMain.handle('logs:getAll', async (
    _event, 
    options?: { limit?: number; cursor?: { id: string; timestamp: string }; sortDirection?: 'asc' | 'desc' }
  ) => {
    // For getAll, we'll use the getLogsWithFilters method without a projectId filter
    // This isn't ideal, but ensures we're using the same pagination logic
    if (options) {
      // We need to provide a dummy projectId that matches all projects
      // The repository should handle this special case
      return repo.getLogsWithFilters({ 
        projectId: '*', 
        ...options 
      });
    }
    return repo.getAllLogs();
  });
  
  ipcMain.handle('logs:getMetadataKeysByProjectId', async (_event, projectId: string) => {
    return repo.getUniqueMetadataKeysByProjectId(projectId);
  });
  
  ipcMain.handle('logs:getProjectMetrics', async (_event, projectId: string) => {
    return repo.getProjectMetrics(projectId);
  });

  ipcMain.handle('logs:getHistoricalCounts', async (_event, projectId: string, days?: number) => {
    return repo.getHistoricalLogCounts(projectId, days);
  });
} 