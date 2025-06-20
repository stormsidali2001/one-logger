import { LogRepository } from '../repositories/logRepository.js';
import { Log, LogFilters } from '../types/log.js';

export class GetLogsByProjectId {
  private logRepository: LogRepository;

  constructor(logRepository: LogRepository) {
    this.logRepository = logRepository;
  }

  async execute(
    projectId: string,
    options?:  LogFilters & {
      cursor?: { id: string; timestamp: string }
      sortDirection?: 'asc' | 'desc'
    },
  ): Promise<{ logs: Log[]; hasNextPage: boolean }> {
    return await this.logRepository.getLogsWithFilters({
      projectId,
      ...options
    });
  }
}