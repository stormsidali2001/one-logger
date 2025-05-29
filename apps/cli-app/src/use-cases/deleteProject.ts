import { ProjectRepository } from '../repositories/projectRepository.js';

export class DeleteProject {
  private projectRepository: ProjectRepository;

  constructor(projectRepository: ProjectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(id: string): Promise<void> {
    await this.projectRepository.deleteProject(id);
  }
}