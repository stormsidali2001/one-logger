import { db } from '../db/db.js';
import { logs, logMetadata } from '../db/schema.js';
import { Log, LogMetadata, LogFilters } from '../../types/log.js';
import { eq, inArray, sql, and, or, like, gt, lt, desc, asc } from 'drizzle-orm';

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
  /**
   * Create a new log with metadata
   */
  async createLog(data: Omit<Log, 'id'>): Promise<Log> {
    const logId = generateUUID();
    
    // Extract metadata from input
    const { metadata, ...logData } = data;
    
    // Create log entry without metadata
    const newLog: Omit<Log, 'metadata'> & { id: string } = {
      id: logId,
      projectId: logData.projectId,
      level: logData.level,
      message: logData.message,
      timestamp: logData.timestamp,
    };
    
    const drizzle = await db.getDrizzle();
    
    // Use a transaction to insert both log and metadata
    await drizzle.transaction(async (tx) => {
      // Insert log
      await tx.insert(logs).values(newLog);
      
      // Insert metadata if provided
      if (metadata && metadata.length > 0) {
        const metadataEntries = metadata.map(meta => ({
          id: generateUUID(),
          logId,
          key: meta.key,
          value: meta.value,
        }));
        
        await tx.insert(logMetadata).values(metadataEntries);
      }
    });
    
    // Return complete log with metadata
    return {
      ...newLog,
      metadata: metadata || [],
    };
  }

  /**
   * Get a log by its ID, including metadata using a JOIN operation
   */
  async getLogById(id: string): Promise<Log | undefined> {
    const drizzle = await db.getDrizzle();
    
    // Get the log with metadata using a JOIN
    const result = await drizzle
      .select({
        log: logs,
        meta: logMetadata,
      })
      .from(logs)
      .leftJoin(logMetadata, eq(logs.id, logMetadata.logId))
      .where(eq(logs.id, id));
    
    if (result.length === 0) return undefined;
    
    // Process results to create the Log object
    const logEntry = result[0].log;
    const metadata: LogMetadata[] = result
      .filter(item => item.meta !== null)
      .map(item => item.meta as LogMetadata);
    
    return {
      ...logEntry,
      metadata,
    };
  }

  /**
   * Get logs for a project, using simple filtering
   */
  async getLogsByProjectId(projectId: string): Promise<Log[]> {
    return this.getLogsWithFilters({ projectId });
  }

  /**
   * Get all unique metadata keys for a specific project
   * This is useful for building UIs that show available metadata fields
   */
  async getUniqueMetadataKeysByProjectId(projectId: string): Promise<string[]> {
    const drizzle = await db.getDrizzle();
    
    // Build query with SQL expressions that select distinct keys
    const result = await drizzle
      .select({ key: logMetadata.key })
      .from(logMetadata)
      .innerJoin(logs, eq(logMetadata.logId, logs.id))
      .where(eq(logs.projectId, projectId))
      .groupBy(logMetadata.key);
    
    // Extract the keys from the result set
    return result.map(row => row.key);
  }

  /**
   * Get logs with advanced filtering and cursor-based pagination
   * Uses a single query with JOINs for better performance
   */
  async getLogsWithFilters(
    filters: LogFilters & { 
      cursor?: { id: string; timestamp: string } 
      sortDirection?: 'asc' | 'desc'
    }
  ): Promise<Log[]> {
    const drizzle = await db.getDrizzle();
    const sortDirection = filters.sortDirection || 'desc';
    const limit = filters.limit || 50;
    
    // Start building the query with a JOIN
    const query = drizzle
      .select({
        log: logs,
        meta: logMetadata,
      })
      .from(logs)
      .leftJoin(logMetadata, eq(logs.id, logMetadata.logId));
    
    // Build conditions array for filtering
    const conditions: any[] = [];
    
    // Handle the projectId filter
    // The '*' projectId is a special case for getting all logs
    if (filters.projectId !== '*') {
      conditions.push(eq(logs.projectId, filters.projectId));
    }
    
    // Add level filter
    if (filters.level) {
      if (Array.isArray(filters.level)) {
        conditions.push(inArray(logs.level, filters.level));
      } else {
        conditions.push(eq(logs.level, filters.level));
      }
    }
    
    // Add message content filter
    if (filters.messageContains) {
      conditions.push(like(logs.message, `%${filters.messageContains}%`));
    }
    
    // Add date range filters
    if (filters.fromDate) {
      const fromDate = new Date(filters.fromDate).toISOString();
      conditions.push(sql`${logs.timestamp} >= ${fromDate}`);
    }
    
    if (filters.toDate) {
      const toDate = new Date(filters.toDate).toISOString();
      conditions.push(sql`${logs.timestamp} <= ${toDate}`);
    }
    
    // Handle cursor-based pagination
    if (filters.cursor) {
      // Add cursor condition based on sort direction
      // When sorting by timestamp, we need to handle the case where timestamps are equal
      // by also comparing IDs to ensure consistent pagination
      if (sortDirection === 'desc') {
        conditions.push(
          or(
            lt(logs.timestamp, filters.cursor.timestamp),
            and(
              eq(logs.timestamp, filters.cursor.timestamp),
              lt(logs.id, filters.cursor.id)
            )
          )
        );
      } else {
        conditions.push(
          or(
            gt(logs.timestamp, filters.cursor.timestamp),
            and(
              eq(logs.timestamp, filters.cursor.timestamp),
              gt(logs.id, filters.cursor.id)
            )
          )
        );
      }
    }
    
    // Handle metadata filtering
    if (filters.metaContains && Object.keys(filters.metaContains).length > 0) {
      const metaPairs = Object.entries(filters.metaContains);
      
      metaPairs.forEach(([key, value]) => {
        conditions.push(
          sql`EXISTS (
            SELECT 1 FROM ${logMetadata}
            WHERE ${logMetadata.logId} = ${logs.id}
            AND ${logMetadata.key} = ${key}
            AND ${logMetadata.value} = ${value}
          )`
        );
      });
    }
    
    // Apply all conditions to the query
    // Only apply conditions if we have any
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }
    
    // Apply sorting
    query.orderBy(
      sortDirection === 'desc' ? desc(logs.timestamp) : asc(logs.timestamp),
      sortDirection === 'desc' ? desc(logs.id) : asc(logs.id)
    );
    
    // Apply limit
    query.limit(limit);
    
    // Execute the query
    const result = await query;
    
    // Group results by log
    const logsMap = new Map<string, Log>();
    
    interface JoinResult {
      log: typeof logs.$inferSelect;
      meta: typeof logMetadata.$inferSelect | null;
    }
    
    (result as JoinResult[]).forEach((row: JoinResult) => {
      const { log, meta } = row;
      
      if (!logsMap.has(log.id)) {
        // Initialize the log entry with empty metadata array
        logsMap.set(log.id, {
          ...log,
          metadata: [],
        });
      }
      
      // Add metadata if it exists
      if (meta) {
        const logEntry = logsMap.get(log.id);
        if (logEntry) {
          logEntry.metadata.push(meta);
        }
      }
    });
    
    // Convert map to array and return
    return Array.from(logsMap.values());
  }

  /**
   * Get all logs with their metadata using a JOIN
   * This is a convenience method that delegates to getLogsWithFilters
   */
  async getAllLogs(): Promise<Log[]> {
    return this.getLogsWithFilters({ projectId: '*' });
  }
} 