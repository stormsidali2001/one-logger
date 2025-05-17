import { Project } from './project';
import { Log, LogFilters, LogCursor, ProjectMetrics } from './log';

// Define pagination options interface
export interface PaginationOptions {
  limit?: number;
  cursor?: LogCursor;
  sortDirection?: 'asc' | 'desc';
}

// Define the main Electron API interface
export interface ElectronAPI {
  getAllProjects: () => Promise<Project[]>;
  getProjectById: (id: string) => Promise<Project | undefined>;
  createProject: (data: { name: string; description: string }) => Promise<Project>;
  updateProject: (id: string, data: Partial<{ name: string; description: string }>) => Promise<Project | undefined>;
  deleteProject: (id: string) => Promise<{ success: boolean }>;
  createLog: (data: Omit<Log, 'id'>) => Promise<Log>;
  getLogById: (id: string) => Promise<Log | undefined>;
  getLogsByProjectId: (projectId: string, options?: PaginationOptions) => Promise<Log[]>;
  getFilteredLogs: (filters: LogFilters) => Promise<Log[]>;
  getAllLogs: (options?: PaginationOptions) => Promise<Log[]>;
  getMetadataKeysByProjectId: (projectId: string) => Promise<string[]>;
  getProjectMetrics: (projectId: string) => Promise<ProjectMetrics>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {}; 