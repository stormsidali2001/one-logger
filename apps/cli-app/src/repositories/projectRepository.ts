import { db } from '../db/db';
import { projects } from '../db/schema';
import { eq } from 'drizzle-orm';
import { Project } from '../types/project';

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
    const newProject: Project = {
      id: generateUUID(),
      name: data.name,
      description: data.description,
      createdAt: new Date().toISOString(),
    };
    const drizzle = await db.getDrizzle();
    await drizzle.insert(projects).values(newProject);
    return newProject;
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    const drizzle = await db.getDrizzle();
    const result = await drizzle.select().from(projects).where(eq(projects.id, id));
    return result[0];
  }

  async getProjectByName(name: string): Promise<Project | undefined> {
    const drizzle = await db.getDrizzle();
    const result = await drizzle.select().from(projects).where(eq(projects.name, name));
    return result[0];
  }

  async getAllProjects(): Promise<Project[]> {
    const drizzle = await db.getDrizzle();
    return drizzle.select().from(projects);
  }

  async updateProject(id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | undefined> {
    const drizzle = await db.getDrizzle();
    await drizzle.update(projects).set(data).where(eq(projects.id, id));
    return this.getProjectById(id);
  }

  async deleteProject(id: string): Promise<void> {
    const drizzle = await db.getDrizzle();
    await drizzle.delete(projects).where(eq(projects.id, id));
  }
}