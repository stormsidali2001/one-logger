import type { Project, ProjectCreate } from './types/project';
import type { Log, LogFilters } from './types/log';

export class ProjectClient {
  constructor(private readonly endpoint: string) {}

  private async fetchWithCredentials(url: string, options?: RequestInit): Promise<Response> {
    const fetchOptions: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      },
    };
    
    return fetch(url, fetchOptions);
  }

  async getById(id: string): Promise<Project | undefined> {
    const res = await this.fetchWithCredentials(`${this.endpoint}/api/projects/${id}`);
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error(`Failed to get project by id: ${res.status} ${res.statusText}`);
    return res.json() as Promise<Project>;
  }

  async getByName(name: string): Promise<Project | undefined> {
    const res = await this.fetchWithCredentials(`${this.endpoint}/api/projects`);
    if (!res.ok) throw new Error(`Failed to get projects: ${res.status} ${res.statusText}`);
    const projects: Project[] = await res.json();
    return projects.find(p => p.name === name);
  }

  async isNameTaken(name: string): Promise<boolean> {
    const encodedName = encodeURIComponent(name);
    const res = await this.fetchWithCredentials(`${this.endpoint}/api/projects/name/${encodedName}/exists`);
    if (!res.ok) throw new Error(`Failed to check if name exists: ${res.status} ${res.statusText}`);
    const { exists } = await res.json() as { exists: boolean };
    return exists;
  }

  async create(data: ProjectCreate): Promise<Project> {
    const res = await this.fetchWithCredentials(`${this.endpoint}/api/projects`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create project: ${res.status} ${res.statusText}`);
    return res.json() as Promise<Project>;
  }

  async delete(id: string): Promise<void> {
    const res = await this.fetchWithCredentials(`${this.endpoint}/api/projects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete project: ${res.status} ${res.statusText}`);
  }

  async getLogs(projectId: string, params: LogFilters): Promise<Log[]> {
    // Build query string from params
    const queryParams = new URLSearchParams();
    
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    
    if (params.sortDirection) {
      queryParams.append('sortDirection', params.sortDirection);
    }
    
    if (params.fromDate) {
      queryParams.append('fromDate', params.fromDate);
    }
    
    if (params.toDate) {
      queryParams.append('toDate', params.toDate);
    }
    
    if (params.messageContains) {
      queryParams.append('messageContains', params.messageContains);
    }
    
    const queryString = queryParams.toString();
    const url = `${this.endpoint}/api/logs/by-project/${projectId}${queryString ? `?${queryString}` : ''}`;
    
    const res = await this.fetchWithCredentials(url);

    if (!res.ok) throw new Error(`Failed to get logs: ${res.status} ${res.statusText}`);
    return res.json() as Promise<Log[]>;
  }
  
  async getUniqueMetadataKeys(projectId: string): Promise<string[]> {
    const res = await this.fetchWithCredentials(`${this.endpoint}/api/logs/metadata-keys/${projectId}`);
    
    if (!res.ok) throw new Error(`Failed to get metadata keys: ${res.status} ${res.statusText}`);
    return res.json() as Promise<string[]>;
  }
} 