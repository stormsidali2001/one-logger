import { db } from '../db/db.js';
import { config } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { ServerManager } from '../server/serverManager.js';
import { ConfigRepository } from '../repositories/configRepository.js';

export class GetConfigUseCase {
  async execute(key: string) {
    const drizzle = await db.getDrizzle();
    const result = await drizzle.select().from(config).where(eq(config.key, key)).get();
    return result?.value ?? null;
  }
}

export class SetConfigUseCase {
  async execute(key: string, value: string) {
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
  }
}

export class GetAllConfigUseCase {
  async execute() {
    const drizzle = await db.getDrizzle();
    return await drizzle.select().from(config).all();
  }
}