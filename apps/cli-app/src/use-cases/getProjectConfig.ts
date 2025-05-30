import { ProjectRepository } from '../repositories/projectRepository.js';
import { ProjectConfig } from '../types/log.js';

export class GetProjectConfig {
  private projectRepository: ProjectRepository;

  constructor(projectRepository: ProjectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(projectId: string): Promise<ProjectConfig> {
    const project = await this.projectRepository.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with id ${projectId} not found`);
    }

    return project.config;
  }
}