import { ConfigRepository } from '../repositories/configRepository.js';
import { ServerManager } from '../server/serverManager.js';

export class SetConfig {
  private configRepository: ConfigRepository;

  constructor(configRepository: ConfigRepository) {
    this.configRepository = configRepository;
  }

  async execute(key: string, value: string): Promise<boolean> {
    await this.configRepository.setValue(key, value);

    // Handle server-specific settings
    if (key === 'server.enabled') {
      const serverManager = ServerManager.getInstance();
      if (value === 'false') {
        // Stop the server if it's being disabled
        await serverManager.stopServer();
      } else {
        // Start the server if it's being enabled
        await serverManager.startServer();
      }
    }

    return true;
  }
}