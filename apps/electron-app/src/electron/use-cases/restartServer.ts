import { ServerManager } from '../server/serverManager.js';

export class RestartServer {
  private serverManager: ServerManager;

  constructor(serverManager: ServerManager) {
    this.serverManager = serverManager;
  }

  async execute(): Promise<any> {
    return await this.serverManager.restartServer();
  }
}