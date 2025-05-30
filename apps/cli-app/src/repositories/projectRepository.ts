import { db } from '../db/db';
import { projects } from '../db/schema';
import { eq } from 'drizzle-orm';
import { Project } from '../types/project';
import { ProjectConfig } from '../types/log';

function generateUUID(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c: string) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class ProjectRepository {

  async createProject(data: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const defaultConfig: ProjectConfig = {
      trackedMetadataKeys: []
    };
    
    const newProject = {
      id: generateUUID(),
      name: data.name,
      description: data.description,
      createdAt: new Date().toISOString(),
      config: JSON.stringify(data.config || defaultConfig),
    };
    
    const drizzle = await db.getDrizzle();
    await drizzle.insert(projects).values(newProject);
    
    return {
      ...newProject,
      config: data.config || defaultConfig,
    };
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    const drizzle = await db.getDrizzle();
    const result = await drizzle.select().from(projects).where(eq(projects.id, id));
    
    if (!result[0]) return undefined;
    
    const project = result[0];
    let config: ProjectConfig;
    try {
      config = JSON.parse(project.config);
    } catch {
      config = { trackedMetadataKeys: [] };
    }
    
    return {
      ...project,
      config,
    };
  }

  async getProjectByName(name: string): Promise<Project | undefined> {
    const drizzle = await db.getDrizzle();
    const result = await drizzle.select().from(projects).where(eq(projects.name, name));
    
    if (!result[0]) return undefined;
    
    const project = result[0];
    let config: ProjectConfig;
    try {
      config = JSON.parse(project.config);
    } catch {
      config = { trackedMetadataKeys: [] };
    }
    
    return {
      ...project,
      config,
    };
  }

  async getAllProjects(): Promise<Project[]> {
    const drizzle = await db.getDrizzle();
    const result = await drizzle.select().from(projects);
    
    return result.map(project => {
      let config: ProjectConfig;
      try {
        config = JSON.parse(project.config);
      } catch {
        config = { trackedMetadataKeys: [] };
      }
      
      return {
        ...project,
        config,
      };
    });
  }

  async updateProject(id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | undefined> {
    const drizzle = await db.getDrizzle();
    
    const updateData: any = { ...data };
    if (data.config) {
      updateData.config = JSON.stringify(data.config);
    }
    
    await drizzle.update(projects).set(updateData).where(eq(projects.id, id));
    return this.getProjectById(id);
  }

  async deleteProject(id: string): Promise<void> {
    const drizzle = await db.getDrizzle();
    await drizzle.delete(projects).where(eq(projects.id, id));
  }
}