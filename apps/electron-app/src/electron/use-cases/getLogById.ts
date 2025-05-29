import { LogRepository } from '../repositories/logRepository.js';
import { Log } from '../../types/log.js';

export class GetLogById {
  private logRepository: LogRepository;

  constructor(logRepository: LogRepository) {
    this.logRepository = logRepository;
  }

  async execute(id: string): Promise<Log | undefined> {
    return await this.logRepository.getLogById(id);
  }
}