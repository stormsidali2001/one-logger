import { LogRepository } from '../repositories/logRepository.js';
import { Log } from '../../types/log.js';

export class CreateLog {
  private logRepository: LogRepository;

  constructor(logRepository: LogRepository) {
    this.logRepository = logRepository;
  }

  async execute(data: Omit<Log, 'id'>): Promise<Log> {
    return await this.logRepository.createLog(data);
  }
}