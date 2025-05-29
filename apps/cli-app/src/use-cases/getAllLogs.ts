import { LogRepository } from '../repositories/logRepository.js';
import { Log } from '../types/log.js';

export class GetAllLogs {
  private logRepository: LogRepository;

  constructor(logRepository: LogRepository) {
    this.logRepository = logRepository;
  }

  async execute(
    options: { limit?: number; cursor?: { id: string; timestamp: string }; sortDirection?: 'asc' | 'desc' }={}
  ): Promise<{ logs: Log[]; hasNextPage: boolean }> {
      // Use the getLogsWithFilters method with a wildcard projectId for pagination
      return await this.logRepository.getLogsWithFilters({
        projectId: '*',
        ...options
      });
  }
}