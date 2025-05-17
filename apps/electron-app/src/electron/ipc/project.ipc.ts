import { ipcMain } from 'electron';
import { ProjectRepository } from '../repositories/projectRepository.js';
import { Project } from '../../types/project.js';

const repo = new ProjectRepository();

export function registerProjectHandlers() {
  ipcMain.handle('projects:getAll', async () => {
    return repo.getAllProjects();
  });

  ipcMain.handle('projects:getById', async (_event, id: string) => {
    return repo.getProjectById(id);
  });

  ipcMain.handle('projects:create', async (_event, data: Omit<Project, 'id' | 'createdAt'>) => {
    return repo.createProject(data);
  });

  ipcMain.handle('projects:update', async (_event, id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
    return repo.updateProject(id, data);
  });

  ipcMain.handle('projects:delete', async (_event, id: string) => {
    await repo.deleteProject(id);
    return { success: true };
  });
} 