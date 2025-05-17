import { contextBridge, ipcRenderer } from 'electron';
import type { Project } from '../types/project.js' with { "resolution-mode": "import" };

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
});
