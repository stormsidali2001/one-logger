import { db } from './db.js';
import { logs } from './schema.js';
import { Log } from '../../types/log.js';
import { eq } from 'drizzle-orm';

function generateUUID(): string {
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
}

export class LogRepository {
  async createLog(data: Omit<Log, 'id'>): Promise<Log> {
    const newLog: Log = {
      id: generateUUID(),
      ...data,
    };
    const drizzle = await db.getDrizzle();
    await drizzle.insert(logs).values(newLog);
    return newLog;
  }

  async getLogById(id: string): Promise<Log | undefined> {
    const drizzle = await db.getDrizzle();
    const result = await drizzle.select().from(logs).where(eq(logs.id, id));
    if (result[0]) {
      return { ...result[0], meta: result[0].meta as Record<string, unknown> };
    }
    return undefined;
  }

  async getLogsByProjectId(projectId: string): Promise<Log[]> {
    const drizzle = await db.getDrizzle();
    const result = await drizzle.select().from(logs).where(eq(logs.projectId, projectId));
    return result.map(l => ({ ...l, meta: l.meta as Record<string, unknown> }));
  }

  async getAllLogs(): Promise<Log[]> {
    const drizzle = await db.getDrizzle();
    const result = await drizzle.select().from(logs);
    return result.map(l => ({ ...l, meta: l.meta as Record<string, unknown> }));
  }
} 