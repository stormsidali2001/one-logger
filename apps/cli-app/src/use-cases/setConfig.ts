import { ConfigRepository } from '../repositories/configRepository.js';
import { ServerManager } from '../server/serverManager.js';

export class SetConfig {

  constructor(private configRepository: ConfigRepository, private serverManager: ServerManager) {
  }

  async execute(key: string, value: string): Promise<boolean> {
    await this.configRepository.setValue(key, value);

    // Handle server-specific settings
    if (key === 'server.enabled') {
      const serverManager = this.serverManager;
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