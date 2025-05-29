import { ProjectRepository } from '../repositories/projectRepository.js';
import { Project } from '../types/project.js';

export class UpdateProject {
  private projectRepository: ProjectRepository;

  constructor(projectRepository: ProjectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | undefined> {
    return await this.projectRepository.updateProject(id, data);
  }
}