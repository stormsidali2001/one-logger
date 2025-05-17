import { contextBridge, ipcRenderer } from 'electron';
import type { Project } from '../types/project.js' with { "resolution-mode": "import" };
import type { Log, LogFilters, LogCursor } from '../types/log.js' with { "resolution-mode": "import" };
import type { PaginationOptions } from '../types/electron.js' with { "resolution-mode": "import" };

// Expose a minimal API to the renderer process for the starter kit
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
});
