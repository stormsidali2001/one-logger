import { ServerManager } from '../server/serverManager.js';

export class ClearServerLogs {
  private serverManager: ServerManager;

  constructor(serverManager: ServerManager) {
    this.serverManager = serverManager;
  }

  execute(type: 'stdout' | 'stderr' | 'all'): any {
    return this.serverManager.clearLogs(type);
  }
}