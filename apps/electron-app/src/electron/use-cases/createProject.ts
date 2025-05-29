import { ProjectRepository } from '../repositories/projectRepository.js';
import { Project } from '../../types/project.js';

export class CreateProject {
  private projectRepository: ProjectRepository;

  constructor(projectRepository: ProjectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(data: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    return await this.projectRepository.createProject(data);
  }
}