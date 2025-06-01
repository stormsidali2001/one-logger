import type { Project, Log, TraceData, ProjectCreateData, ProjectUpdateData, ProjectConfig, ProjectMetrics, LogsOptions, TracesOptions, HistoricalCountsOptions, PaginationOptions, LogCursor } from '@one-logger/types';
import type { HttpClient } from '../client.js';

export class ProjectsModule {
  constructor(private client: HttpClient) {}

  /**
   * Get all projects
   */
  async getAll(): Promise<Project[]> {
    return this.client.get<Project[]>('/api/projects');
  }

  /**
   * Get project by ID
   */
  async getById(id: string): Promise<Project> {
    return this.client.get<Project>(`/api/projects/${id}`);
  }

  /**
   * Check if project exists by name
   */
  async exists(name: string): Promise<{ exists: boolean ,project?:Project | null}> {
    return this.client.get<{ exists: boolean ,project?:Project | null}>(`/api/projects/exists/${name}`);
  }

  /**
   * Create a new project
   */
  async create(data: ProjectCreateData): Promise<Project> {
    return this.client.post<Project>('/api/projects', data);
  }

  /**
   * Update a project
   */
  async update(id: string, data: ProjectUpdateData): Promise<Project> {
    return this.client.put<Project>(`/api/projects/${id}`, data);
  }

  /**
   * Delete a project
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(`/api/projects/${id}`);
  }

  /**
   * Get project metrics
   */
  async getMetrics(projectId: string): Promise<ProjectMetrics> {
    return this.client.get<ProjectMetrics>(`/api/projects/${projectId}/metrics`);
  }

  /**
   * Get logs for a project
   */
  async getLogs(projectId: string, options?: LogsOptions): Promise<{ logs: Log[]; hasNextPage: boolean }> {
    const params: Record<string, any> = {};
    
    if (options) {
      if (options.limit) params.limit = options.limit.toString();
      if (options.cursor) params.cursor = JSON.stringify(options.cursor);
      if (options.sortDirection) params.sortDirection = options.sortDirection;
      if (options.level) params.level = options.level;
      if (options.messageContains) params.messageContains = options.messageContains;
      if (options.fromDate) params.fromDate = options.fromDate;
      if (options.toDate) params.toDate = options.toDate;
      if (options.metaContains) params.metaContains = JSON.stringify(options.metaContains);
      if (options.metadata) params.metadata = JSON.stringify(options.metadata);
    }

    return this.client.get<{ logs: Log[]; hasNextPage: boolean }>(`/api/projects/${projectId}/logs`, params);
  }

  /**
   * Get historical log counts for a project
   */
  async getHistoricalLogCounts(
    projectId: string, 
    options?: HistoricalCountsOptions
  ): Promise<any[]> {
    const params: Record<string, any> = {};
    if (options?.days) params.days = options.days.toString();
    
    return this.client.get<any[]>(`/api/projects/${projectId}/logs/historical-counts`, params);
  }

  /**
   * Get metadata keys for a project
   */
  async getMetadataKeys(projectId: string): Promise<string[]> {
    return this.client.get<string[]>(`/api/projects/${projectId}/metadata-keys`);
  }

  /**
   * Get project configuration
   */
  async getConfig(projectId: string): Promise<ProjectConfig> {
    return this.client.get<ProjectConfig>(`/api/projects/${projectId}/config`);
  }

  /**
   * Update project configuration
   */
  async updateConfig(projectId: string, config: ProjectConfig): Promise<ProjectConfig> {
    return this.client.put<ProjectConfig>(`/api/projects/${projectId}/config`, config);
  }

  /**
   * Clear all logs for a project
   */
  async clearLogs(projectId: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(`/api/projects/${projectId}/logs`);
  }

  /**
   * Get traces for a project
   */
  async getTraces(projectId: string, options?: TracesOptions): Promise<TraceData[]> {
    const params: Record<string, any> = {};
    
    if (options) {
      if (options.limit) params.limit = options.limit.toString();
      if (options.cursor) params.cursor = JSON.stringify(options.cursor);
      if (options.sortDirection) params.sortDirection = options.sortDirection;
    }

    return this.client.get<TraceData[]>(`/api/traces/project/${projectId}`, params);
  }

  /**
   * Clear all traces for a project
   */
  async clearTraces(projectId: string): Promise<void> {
    return this.client.delete<void>(`/api/traces/project/${projectId}`);
  }
}