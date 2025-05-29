import { ConfigRepository } from '../repositories/configRepository.js';

export class GetConfig {
  private configRepository: ConfigRepository;

  constructor(configRepository: ConfigRepository) {
    this.configRepository = configRepository;
  }

  async execute(key: string): Promise<string | null> {
    return await this.configRepository.getValue(key);
  }
}