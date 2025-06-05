import { LogRepository } from '../repositories/logRepository.js';
import { Log } from '../types/log.js';

export class CreateBulkLog {
  private logRepository: LogRepository;

  constructor(logRepository: LogRepository) {
    this.logRepository = logRepository;
  }

  async execute(logsData: Omit<Log, 'id'>[]): Promise<Log[]> {
    if (!logsData || logsData.length === 0) {
      throw new Error('No log data provided');
    }

    // Validate each log data
    for (const logData of logsData) {
      if (!logData.projectId || !logData.level || !logData.message || !logData.timestamp) {
        throw new Error('Missing required fields in log data: projectId, level, message, timestamp');
      }
    }

    return await this.logRepository.createBulkLog(logsData);
  }
}