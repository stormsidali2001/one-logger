import { registerConfigHandlers } from './config.ipc.js';
import { registerProjectHandlers } from './project.ipc.js';
import { registerLogHandlers } from './log.ipc.js';
import { registerServerHandlers } from './server.ipc.js';
import { registerMCPServerHandlers } from './mcpServer.ipc.js';

// Minimal IPC registration for starter kit
export function registerIpcHandlers() {
  registerConfigHandlers();
  registerProjectHandlers();
  registerLogHandlers();
  registerServerHandlers();
  registerMCPServerHandlers();
} 