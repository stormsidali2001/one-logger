import { contextBridge, ipcRenderer } from 'electron';
import type { Project } from './src/types/project.js' with { "resolution-mode": "import" };
import type { Log, LogFilters, ProjectMetrics } from './src/types/log.js' with { "resolution-mode": "import" };
import type { PaginationOptions } from './src/types/electron.js' with { "resolution-mode": "import" };

// Expose a minimal API to the renderer process for the starter kit
contextBridge.exposeInMainWorld('electron', {
  // Config methods
  configGet: (key: string) => ipcRenderer.invoke('config:get', key),
  configSet: (key: string, value: string) => ipcRenderer.invoke('config:set', key, value),
  configGetAll: () => ipcRenderer.invoke('config:getAll'),
  
  // Server management
  restartServer: () => ipcRenderer.invoke('server:restart'),
  stopServer: () => ipcRenderer.invoke('server:stop'),
  getServerLogs: (type: 'stdout' | 'stderr' | 'all') => ipcRenderer.invoke('server:getLogs', type),
  clearServerLogs: (type: 'stdout' | 'stderr' | 'all') => ipcRenderer.invoke('server:clearLogs', type),
  
  // MCP Server management
  restartMCPServer: () => ipcRenderer.invoke('mcpServer:restart'),
  stopMCPServer: () => ipcRenderer.invoke('mcpServer:stop'),
  getMCPServerLogs: (type: 'stdout' | 'stderr' | 'all') => ipcRenderer.invoke('mcpServer:getLogs', type),
  clearMCPServerLogs: (type: 'stdout' | 'stderr' | 'all') => ipcRenderer.invoke('mcpServer:clearLogs', type),
  
  // Example: you can add your own APIs here
  ping: () => ipcRenderer.invoke('ping'),
});

// Keep the existing API for backward compatibility
contextBridge.exposeInMainWorld('electronAPI', {
  // Example: you can add your own APIs here
  ping: () => ipcRenderer.invoke('ping'),
  getConfig: (key: string) => ipcRenderer.invoke('config:get', key),
  setConfig: (key: string, value: string) => ipcRenderer.invoke('config:set', key, value),
  getAllConfigs: () => ipcRenderer.invoke('config:getAll'),
  getAllProjects: (): Promise<Project[]> => ipcRenderer.invoke('projects:getAll'),
  getProjectById: (id: string): Promise<Project | undefined> => ipcRenderer.invoke('projects:getById', id),
  createProject: (data: { name: string; description: string }): Promise<Project> => ipcRenderer.invoke('projects:create', data),
  updateProject: (id: string, data: Partial<{ name: string; description: string }>): Promise<Project | undefined> => ipcRenderer.invoke('projects:update', id, data),
  deleteProject: (id: string): Promise<{ success: boolean }> => ipcRenderer.invoke('projects:delete', id),
  createLog: (data: Omit<Log, 'id'>) => ipcRenderer.invoke('logs:create', data),
  getLogById: (id: string) => ipcRenderer.invoke('logs:getById', id),
  getLogsByProjectId: (projectId: string, options?: PaginationOptions) => 
    ipcRenderer.invoke('logs:getByProjectId', projectId, options),
  getFilteredLogs: (filters: LogFilters) => ipcRenderer.invoke('logs:getFiltered', filters),
  getAllLogs: (options?: PaginationOptions) => ipcRenderer.invoke('logs:getAll', options),
  getMetadataKeysByProjectId: (projectId: string): Promise<string[]> => 
    ipcRenderer.invoke('logs:getMetadataKeysByProjectId', projectId),
  getProjectMetrics: (projectId: string): Promise<ProjectMetrics> =>
    ipcRenderer.invoke('logs:getProjectMetrics', projectId),
  getHistoricalLogCounts: (projectId: string, days?: number): Promise<Array<{
    date: string;
    info: number;
    warn: number;
    error: number;
    total: number;
  }>> => 
    ipcRenderer.invoke('logs:getHistoricalCounts', projectId, days),
});
