import { LogRepository } from '../repositories/logRepository.js';

export class ClearProjectLogs {
  private logRepository: LogRepository;

  constructor(logRepository: LogRepository) {
    this.logRepository = logRepository;
  }

  async execute(projectId: string): Promise<void> {
    await this.logRepository.clearProjectLogs(projectId);
  }
}