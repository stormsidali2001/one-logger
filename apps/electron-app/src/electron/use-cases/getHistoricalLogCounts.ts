import { LogRepository } from '../repositories/logRepository.js';

export class GetHistoricalLogCounts {
  private logRepository: LogRepository;

  constructor(logRepository: LogRepository) {
    this.logRepository = logRepository;
  }

  async execute(projectId: string, days?: number): Promise<any> {
    return await this.logRepository.getHistoricalLogCounts(projectId, days);
  }
}