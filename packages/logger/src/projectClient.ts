import { Project, ProjectCreate } from './types/project';
import { Log } from './types/log';

export class ProjectClient {
  constructor(private readonly endpoint: string) {}

  async getById(id: string): Promise<Project | undefined> {
    const res = await fetch(`${this.endpoint}/api/projects/${id}`);
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error(`Failed to get project by id: ${res.status} ${res.statusText}`);
    return res.json() as Promise<Project>;
  }

  async getByName(name: string): Promise<Project | undefined> {
    const res = await fetch(`${this.endpoint}/api/projects`);
    if (!res.ok) throw new Error(`Failed to get projects: ${res.status} ${res.statusText}`);
    const projects: Project[] = await res.json();
    return projects.find(p => p.name === name);
  }

  async create(data: ProjectCreate): Promise<Project> {
    const res = await fetch(`${this.endpoint}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create project: ${res.status} ${res.statusText}`);
    return res.json() as Promise<Project>;
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`${this.endpoint}/api/projects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete project: ${res.status} ${res.statusText}`);
  }

  async getLogs(projectId: string): Promise<Log[]> {
    const res = await fetch(`${this.endpoint}/api/logs/by-project/${projectId}`);
    if (!res.ok) throw new Error(`Failed to get logs: ${res.status} ${res.statusText}`);
    return res.json() as Promise<Log[]>;
  }
} 