import { ConfigRepository } from '../repositories/configRepository.js';

export class GetAllConfig {
  private configRepository: ConfigRepository;

  constructor(configRepository: ConfigRepository) {
    this.configRepository = configRepository;
  }

  async execute(): Promise<{ key: string; value: string }[]> {
    return await this.configRepository.getAll();
  }
}