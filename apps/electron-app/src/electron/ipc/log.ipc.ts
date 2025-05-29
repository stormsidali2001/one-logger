import { ipcMain } from 'electron';
import { LogRepository } from '../repositories/logRepository.js';
import { Log, LogFilters } from '../../types/log.js';
import { CreateLog } from '../use-cases/createLog.js';
import { GetLogById } from '../use-cases/getLogById.js';
import { GetLogsByProjectId } from '../use-cases/getLogsByProjectId.js';
import { GetFilteredLogs } from '../use-cases/getFilteredLogs.js';
import { GetAllLogs } from '../use-cases/getAllLogs.js';
import { GetMetadataKeysByProjectId } from '../use-cases/getMetadataKeysByProjectId.js';
import { GetProjectMetrics } from '../use-cases/getProjectMetrics.js';
import { GetHistoricalLogCounts } from '../use-cases/getHistoricalLogCounts.js';

export function registerLogHandlers() {
  const logRepository = new LogRepository();
  const createLog = new CreateLog(logRepository);
  const getLogById = new GetLogById(logRepository);
  const getLogsByProjectId = new GetLogsByProjectId(logRepository);
  const getFilteredLogs = new GetFilteredLogs(logRepository);
  const getAllLogs = new GetAllLogs(logRepository);
  const getMetadataKeysByProjectId = new GetMetadataKeysByProjectId(logRepository);
  const getProjectMetrics = new GetProjectMetrics(logRepository);
  const getHistoricalLogCounts = new GetHistoricalLogCounts(logRepository);

  ipcMain.handle('logs:create', async (_event, data: Omit<Log, 'id'>) => {
    return createLog.execute(data);
  });

  ipcMain.handle('logs:getById', async (_event, id: string) => {
    return getLogById.execute(id);
  });

  ipcMain.handle('logs:getByProjectId', async (_event, projectId: string,
    options?: { limit?: number; cursor?: { id: string; timestamp: string }; sortDirection?: 'asc' | 'desc' }) => {
    return getLogsByProjectId.execute(projectId, options);
  });

  ipcMain.handle('logs:getFiltered', async (_event, filters: LogFilters) => {
    return getFilteredLogs.execute(filters);
  });

  ipcMain.handle('logs:getAll', async (
    _event,
    options?: { limit?: number; cursor?: { id: string; timestamp: string }; sortDirection?: 'asc' | 'desc' }
  ) => {
    return getAllLogs.execute(options);
  });

  ipcMain.handle('logs:getMetadataKeysByProjectId', async (_event, projectId: string) => {
    return getMetadataKeysByProjectId.execute(projectId);
  });

  ipcMain.handle('logs:getProjectMetrics', async (_event, projectId: string) => {
    return getProjectMetrics.execute(projectId);
  });

  ipcMain.handle('logs:getHistoricalCounts', async (_event, projectId: string, days?: number) => {
    return getHistoricalLogCounts.execute(projectId, days);
  });
}