import { LogRepository } from '../repositories/logRepository.js';
import { Log, LogFilters } from '../types/log.js';

export class GetFilteredLogs {
  private logRepository: LogRepository;

  constructor(logRepository: LogRepository) {
    this.logRepository = logRepository;
  }

  async execute(filters: LogFilters): Promise<{ logs: Log[]; hasNextPage: boolean }> {
    return await this.logRepository.getLogsWithFilters(filters);
  }
}