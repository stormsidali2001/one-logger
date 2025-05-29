import { LogRepository } from '../repositories/logRepository.js';

export class GetMetadataKeysByProjectId {
  private logRepository: LogRepository;

  constructor(logRepository: LogRepository) {
    this.logRepository = logRepository;
  }

  async execute(projectId: string): Promise<string[]> {
    return await this.logRepository.getUniqueMetadataKeysByProjectId(projectId);
  }
}