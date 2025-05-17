import { ipcMain } from 'electron';
import { db } from '../db/db.js';
import { config } from '../db/schema.js';
import { eq } from 'drizzle-orm';

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
    return true;
  });

  ipcMain.handle('config:getAll', async () => {
    const drizzle = await db.getDrizzle();
    return await drizzle.select().from(config).all();
  });
} 