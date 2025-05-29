import { ProjectRepository } from '../repositories/projectRepository.js';
import { Project } from '../../types/project.js';

export class GetAllProjects {
  private projectRepository: ProjectRepository;

  constructor(projectRepository: ProjectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(): Promise<Project[]> {
    return await this.projectRepository.getAllProjects();
  }
}