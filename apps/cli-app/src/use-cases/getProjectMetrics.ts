import { LogRepository } from '../repositories/logRepository.js';

export class GetProjectMetrics {
  private logRepository: LogRepository;

  constructor(logRepository: LogRepository) {
    this.logRepository = logRepository;
  }

  async execute(projectId: string): Promise<any> {
    return await this.logRepository.getProjectMetrics(projectId);
  }
}