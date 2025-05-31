import type { Log } from "@/types/log";

// API client for communicating with the CLI server
const API_BASE_URL = 'http://localhost:3001'; // This should match the CLI server port

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Config API methods
  async getConfig(key: string): Promise<string | null> {
    const res = await this.request<{value:string}>(`/api/config/${key}`);

    return res.value;
  }

  async getAllConfigs(): Promise<Record<string, string>> {
    return this.request('/api/config');
  }

  async setConfig(key: string, value: string): Promise<void> {
    return this.request(`/api/config/${key}`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    });
  }

  // Projects API methods
  async getProjects(): Promise<any[]> {
    return this.request('/api/projects');
  }

  async getProjectById(id: string): Promise<any> {
    return this.request(`/api/projects/${id}`);
  }

  async createProject(data: { name: string; description: string }): Promise<any> {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: Partial<{ name: string; description: string }>): Promise<any> {
    return this.request(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<void> {
    return this.request(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async getProjectMetrics(id: string): Promise<any> {
    return this.request(`/api/projects/${id}/metrics`);
  }

  async getProjectConfig(id: string): Promise<any> {
    return this.request(`/api/projects/${id}/config`);
  }

  async updateProjectConfig(id: string, config: { trackedMetadataKeys?: string[] }): Promise<void> {
    return this.request(`/api/projects/${id}/config`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async clearProjectLogs(id: string): Promise<void> {
    return this.request(`/api/projects/${id}/logs`, {
      method: 'DELETE',
    });
  }

  // Logs API methods
  async getLogs(options?: { limit?: number; cursor?: string; sortDirection?: 'asc' | 'desc' }): Promise<{ logs: Log[]; hasNextPage: boolean }> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.cursor) params.append('cursor', options.cursor);
    if (options?.sortDirection) params.append('sortDirection', options.sortDirection);
    
    const queryString = params.toString();
    return this.request(`/api/logs${queryString ? `?${queryString}` : ''}`);
  }

  async getLogById(id: string): Promise<any> {
    return this.request(`/api/logs/${id}`);
  }

  async createLog(data: { projectId: string; message: string; level: string; metadata?: Record<string, any> }): Promise<any> {
    return this.request('/api/logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLogsByProjectId(projectId: string, options?: { 
    limit?: number; 
    cursor?:  { id: string; timestamp: string }; 
    sortDirection?: 'asc' | 'desc';
    level?: string | string[];
    messageContains?: string;
    fromDate?: string;
    toDate?: string;
    metaContains?: Record<string, string>;
    metadata?: Array<{ key: string; value: string }>;
  }): Promise<{ logs: Log[]; hasNextPage: boolean }> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.cursor) {
      params.append('cursor', JSON.stringify(options.cursor));
    }
    if (options?.sortDirection) params.append('sortDirection', options.sortDirection);
    if (options?.level) {
         if(Array.isArray(options.level)  ){
          options.level.forEach(level => {
            params.append('level', level);
          });

         }else{
          params.append('level', options.level);

         }
    }
    if (options?.messageContains) params.append('messageContains', options.messageContains);
    if (options?.fromDate) params.append('fromDate', options.fromDate);
    if (options?.toDate) params.append('toDate', options.toDate);
    if (options?.metaContains) params.append('metaContains', JSON.stringify(options.metaContains));
    if (options?.metadata) params.append('metadata', JSON.stringify(options.metadata));
    
    const queryString = params.toString();
    return this.request(`/api/projects/${projectId}/logs${queryString ? `?${queryString}` : ''}`);
  }

  async getHistoricalLogCounts(projectId: string, days: number): Promise<any[]> {
    return this.request(`/api/projects/${projectId}/logs/historical-counts/?days=${days}`);
  }

  // Server API methods
  async getServerLogs(type: 'stdout' | 'stderr' | 'all' = 'all'): Promise<any[]> {
    return this.request(`/api/server/logs?type=${type}`);
  }

  async getMCPServerLogs(type: 'stdout' | 'stderr' | 'all' = 'all'): Promise<any[]> {
    return this.request(`/api/server/mcp-logs?type=${type}`);
  }

  async clearServerLogs(type: 'stdout' | 'stderr' | 'all'): Promise<void> {
    return this.request('/api/server/logs/clear', {
      method: 'POST',
      body: JSON.stringify({ type }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async clearMCPServerLogs(type: 'stdout' | 'stderr' | 'all'): Promise<void> {
    return this.request('/api/server/mcp-logs/clear', {
      method: 'POST',
      body: JSON.stringify({ type }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async restartServer(): Promise<void> {
    return this.request('/api/server/restart', {
      method: 'POST',
    });
  }

  async restartMCPServer(): Promise<void> {
    return this.request('/api/server/mcp/restart', {
      method: 'POST',
    });
  }

  // Metadata API methods
  async getMetadataKeys(): Promise<string[]> {
    return this.request('/api/metadata/keys');
  }
}

export const apiClient = new ApiClient();