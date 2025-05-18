import { db } from '../db/db.js';
import { config } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export class ConfigRepository {
  async getValue(key: string): Promise<string | null> {
    const drizzle = await db.getDrizzle();
    const result = await drizzle.select().from(config).where(eq(config.key, key)).get();
    return result?.value ?? null;
  }

  async setValue(key: string, value: string): Promise<void> {
    const drizzle = await db.getDrizzle();
    await drizzle.insert(config).values({ key, value }).onConflictDoUpdate({
      target: config.key,
      set: { value },
    });
  }

  async getAll(): Promise<{ key: string; value: string }[]> {
    const drizzle = await db.getDrizzle();
    return await drizzle.select().from(config).all();
  }
} 