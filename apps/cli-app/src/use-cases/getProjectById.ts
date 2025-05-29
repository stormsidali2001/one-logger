import { ProjectRepository } from '../repositories/projectRepository.js';
import { Project } from '../types/project.js';

export class GetProjectById {
  private projectRepository: ProjectRepository;

  constructor(projectRepository: ProjectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(id: string): Promise<Project | undefined> {
    return await this.projectRepository.getProjectById(id);
  }
}