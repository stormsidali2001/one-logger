import { ipcMain } from 'electron';
import { ProjectRepository } from '../repositories/projectRepository.js';
import { Project } from '../../types/project.js';
import { GetAllProjects } from '../use-cases/getAllProjects.js';
import { GetProjectById } from '../use-cases/getProjectById.js';
import { CreateProject } from '../use-cases/createProject.js';
import { UpdateProject } from '../use-cases/updateProject.js';
import { DeleteProject } from '../use-cases/deleteProject.js';

export function registerProjectHandlers() {
  const projectRepository = new ProjectRepository();
  const getAllProjects = new GetAllProjects(projectRepository);
  const getProjectById = new GetProjectById(projectRepository);
  const createProject = new CreateProject(projectRepository);
  const updateProject = new UpdateProject(projectRepository);
  const deleteProject = new DeleteProject(projectRepository);

  ipcMain.handle('projects:getAll', async () => {
    return getAllProjects.execute();
  });

  ipcMain.handle('projects:getById', async (_event, id: string) => {
    return getProjectById.execute(id);
  });

  ipcMain.handle('projects:create', async (_event, data: Omit<Project, 'id' | 'createdAt'>) => {
    return createProject.execute(data);
  });

  ipcMain.handle('projects:update', async (_event, id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
    return updateProject.execute(id, data);
  });

  ipcMain.handle('projects:delete', async (_event, id: string) => {
    await deleteProject.execute(id);
    return { success: true };
  });
}