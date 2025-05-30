import { ProjectRepository } from '../repositories/projectRepository.js';
import { ProjectConfig } from '../types/log.js';

export class UpdateProjectConfig {
  private projectRepository: ProjectRepository;

  constructor(projectRepository: ProjectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(projectId: string, config: ProjectConfig): Promise<void> {
    const project = await this.projectRepository.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with id ${projectId} not found`);
    }

    await this.projectRepository.updateProject(projectId, { config });
  }
}