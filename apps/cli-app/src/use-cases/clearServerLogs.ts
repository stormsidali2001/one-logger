import { ServerManager } from '../server/serverManager.js';

export class ClearServerLogs {

  constructor(private serverManager: ServerManager) {
  }

  execute(type: 'stdout' | 'stderr' | 'all'): any {
    return this.serverManager.clearLogs(type);
  }
}