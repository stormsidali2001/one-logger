import { Project } from './project';
import { Log } from './log';

// Define the structure of the habits API

// Define the main Electron API interface
export interface ElectronAPI {
  getAllProjects: () => Promise<Project[]>;
  getProjectById: (id: string) => Promise<Project | undefined>;
  createProject: (data: { name: string; description: string }) => Promise<Project>;
  updateProject: (id: string, data: Partial<{ name: string; description: string }>) => Promise<Project | undefined>;
  deleteProject: (id: string) => Promise<{ success: boolean }>;
  createLog: (data: Omit<Log, 'id'>) => Promise<Log>;
  getLogById: (id: string) => Promise<Log | undefined>;
  getLogsByProjectId: (projectId: string) => Promise<Log[]>;
  getAllLogs: () => Promise<Log[]>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {}; 