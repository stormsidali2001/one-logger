import { ipcMain } from 'electron';
import { db } from '../db/db.js';
import { config } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { ServerManager } from '../server/serverManager.js';

export function registerConfigHandlers() {
  ipcMain.handle('config:get', async (_event, key: string) => {
    const drizzle = await db.getDrizzle();
    const result = await drizzle.select().from(config).where(eq(config.key, key)).get();
    return result?.value ?? null;
  });

  ipcMain.handle('config:set', async (_event, key: string, value: string) => {
    const drizzle = await db.getDrizzle();
    await drizzle.insert(config).values({ key, value }).onConflictDoUpdate({
      target: config.key,
      set: { value },
    });
    
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
  });

  ipcMain.handle('config:getAll', async () => {
    const drizzle = await db.getDrizzle();
    return await drizzle.select().from(config).all();
  });
} 