import { db } from '../db/db';
import { logs, logMetadata, metadata, projects } from '../db/schema';
import { Log, LogMetadata, LogFilters, ProjectMetrics, ProjectConfig } from '../types/log';
import { eq, inArray, sql, and, or, like, gt, lt, desc, asc, count } from 'drizzle-orm';
import { DrizzleTransaction } from '../db/db';

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
   * Get project configuration
   */
  private async getProjectConfig(projectId: string): Promise<ProjectConfig> {
    const drizzle = await db.getDrizzle();
    const result = await drizzle
      .select({ config: projects.config })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);
    
    if (result.length === 0) {
      return { trackedMetadataKeys: [] }
      
    }
    
    try {
      return JSON.parse(result[0].config) as ProjectConfig;
    } catch {
      return { trackedMetadataKeys: [] };
    }
  }

  /**
   * Create a new log with metadata
   */
  async createLog(data: Omit<Log, 'id'>, tsx: DrizzleTransaction | null = null): Promise<Log> {
    const logId = generateUUID();
    const { metadata: logMetadataArray, ...logData } = data;
    const drizzle = tsx ? tsx : await db.getDrizzle();

    // Get project configuration to determine which metadata should be tracked
    const projectConfig = await this.getProjectConfig(logData.projectId);
    const trackedKeys = new Set(projectConfig.trackedMetadataKeys || []);

    // Separate metadata into tracked and embedded
    const trackedMetadata: LogMetadata[] = [];
    const embeddedMetadata: Record<string, string> = {};

    if (logMetadataArray && logMetadataArray.length > 0) {
      logMetadataArray.forEach(meta => {
        if (trackedKeys.has(meta.key)) {
          trackedMetadata.push(meta);
        } else {
          embeddedMetadata[meta.key] = meta.value;
        }
      });
    }

    // Create log entry with embedded metadata
    const newLog = {
      id: logId,
      projectId: logData.projectId,
      level: logData.level,
      message: logData.message,
      timestamp: logData.timestamp,
      embeddedMetadata: JSON.stringify(embeddedMetadata),
    };

    // Use a transaction to insert both log and tracked metadata
    await drizzle.transaction(async (tx) => {
      // Insert log
      await tx.insert(logs).values(newLog);

      // Insert tracked metadata if any
      if (trackedMetadata.length > 0) {
        // For each tracked metadata, find or create metadata entry, then create association
        for (const meta of trackedMetadata) {
          // Check if metadata already exists for this project
          let existingMetadata = await tx
            .select({ id: metadata.id })
            .from(metadata)
            .where(
              and(
                eq(metadata.projectId, logData.projectId),
                eq(metadata.key, meta.key),
                eq(metadata.value, meta.value)
              )
            )
            .limit(1);

          let metadataId: string;
          
          if (existingMetadata.length > 0) {
            // Use existing metadata
            metadataId = existingMetadata[0].id;
          } else {
            // Create new metadata entry
            metadataId = generateUUID();
            await tx.insert(metadata).values({
              id: metadataId,
              projectId: logData.projectId,
              key: meta.key,
              value: meta.value,
            });
          }

          // Create log-metadata association
          await tx.insert(logMetadata).values({
            id: generateUUID(),
            logId,
            metadataId,
          });
        }
      }
    });

    // Return complete log with all metadata combined
    const allMetadata: LogMetadata[] = [
      ...trackedMetadata,
      ...Object.entries(embeddedMetadata).map(([key, value]) => ({ key, value }))
    ];

    return {
      id: logId,
      projectId: logData.projectId,
      level: logData.level,
      message: logData.message,
      timestamp: logData.timestamp,
      metadata: allMetadata,
    };
  }

  /**
   * Create multiple logs in a single transaction
   */
  async createBulkLog(logsData: Omit<Log, 'id'>[]): Promise<Log[]> {
    const drizzle = await db.getDrizzle();
    const createdLogs: Log[] = [];

    await drizzle.transaction(async (tx) => {
      for (const logData of logsData) {
        const createdLog = await this.createLog(logData, tx as DrizzleTransaction)
        createdLogs.push(createdLog);
      }
    });

    return createdLogs;
  }

  /**
   * Get a log by its ID, including metadata using a JOIN operation
   */
  async getLogById(id: string): Promise<Log | undefined> {
    const drizzle = await db.getDrizzle();

    // Get the log with tracked metadata using JOINs through the bridge table
    const result = await drizzle
      .select({
        log: logs,
        meta: metadata,
      })
      .from(logs)
      .leftJoin(logMetadata, eq(logs.id, logMetadata.logId))
      .leftJoin(metadata, eq(logMetadata.metadataId, metadata.id))
      .where(eq(logs.id, id));

    if (result.length === 0) return undefined;

    // Process results to create the Log object
    const logEntry = result[0].log;
    const trackedMetadata: LogMetadata[] = result
      .filter(item => item.meta !== null)
      .map(item => ({ key: item.meta!.key, value: item.meta!.value }));

    // Parse embedded metadata
    let embeddedMetadata: Record<string, string> = {};
    try {
      embeddedMetadata = JSON.parse(logEntry.embeddedMetadata || '{}');
    } catch {
      embeddedMetadata = {};
    }

    // Combine tracked and embedded metadata
    const allMetadata: LogMetadata[] = [
      ...trackedMetadata,
      ...Object.entries(embeddedMetadata).map(([key, value]) => ({ key, value }))
    ];

    return {
      id: logEntry.id,
      projectId: logEntry.projectId,
      level: logEntry.level,
      message: logEntry.message,
      timestamp: logEntry.timestamp,
      metadata: allMetadata,
    };
  }

  /**
   * Get logs for a project, using simple filtering
   */
  async getLogsByProjectId(projectId: string): Promise<Log[]> {
    const { logs } = await this.getLogsWithFilters({ projectId });
    return logs;
  }

  /**
   * Get all unique metadata keys for a specific project
   * This is useful for building UIs that show available metadata fields
   */
  async getUniqueMetadataKeysByProjectId(projectId: string): Promise<string[]> {
    const drizzle = await db.getDrizzle();
    const keysSet = new Set<string>();

    // Get tracked metadata keys
    const trackedResult = await drizzle
      .select({ key: metadata.key })
      .from(metadata)
      .where(eq(metadata.projectId, projectId))
      .groupBy(metadata.key);

    trackedResult.forEach(row => keysSet.add(row.key));



    return Array.from(keysSet).sort();
  }

  /**
   * Get all unique metadata keys across all projects
   * This is useful for building UIs that show available metadata fields globally
   */
  async getMetadataKeys(): Promise<string[]> {
    const drizzle = await db.getDrizzle();
    const keysSet = new Set<string>();

    // Get tracked metadata keys
    const trackedResult = await drizzle
      .select({ key: metadata.key })
      .from(metadata)
      .groupBy(metadata.key);

    trackedResult.forEach(row => keysSet.add(row.key));


    return Array.from(keysSet).sort();
  }

  /**
   * Get logs with advanced filtering and cursor-based pagination
   * Uses a subquery to correctly apply limits to distinct logs before fetching metadata.
   */
  async getLogsWithFilters(
    filters: LogFilters & {
      cursor?: { id: string; timestamp: string }
      sortDirection?: 'asc' | 'desc'
    }
  ): Promise<{ logs: Log[]; hasNextPage: boolean }> {
    const drizzle = await db.getDrizzle();
    const sortDirection = filters.sortDirection || 'desc';
    const limit = filters.limit || 50; // The number of unique logs to return
    const fetchLimitPlusOne = limit + 1; // Fetch one extra unique log to determine hasNextPage

    // --- Conditions for the subquery selecting distinct log IDs ---
    const allSubQueryConditions: any[] = [];

    // Project ID filter
    if (filters.projectId && filters.projectId !== '*') {
      allSubQueryConditions.push(eq(logs.projectId, filters.projectId));
    }
    // Level filter
    if (filters.level) {
      allSubQueryConditions.push(Array.isArray(filters.level) ? inArray(logs.level, filters.level) : eq(logs.level, filters.level));
    }
    // Message contains filter
    if (filters.messageContains) {
      allSubQueryConditions.push(like(logs.message, `%${filters.messageContains}%`));
    }
    // Date range filters
    if (filters.fromDate) {
      allSubQueryConditions.push(sql`${logs.timestamp} >= ${new Date(filters.fromDate).toISOString()}`);
    }
    if (filters.toDate) {
      allSubQueryConditions.push(sql`${logs.timestamp} <= ${new Date(filters.toDate).toISOString()}`);
    }

    // Cursor conditions
    if (filters.cursor) {
      const cursorTimestamp = filters.cursor.timestamp;
      const cursorId = filters.cursor.id;
      if (sortDirection === 'desc') {
        allSubQueryConditions.push(
          or(
            lt(logs.timestamp, cursorTimestamp),
            and(eq(logs.timestamp, cursorTimestamp), lt(logs.id, cursorId))
          )
        );
      } else { // asc
        allSubQueryConditions.push(
          or(
            gt(logs.timestamp, cursorTimestamp),
            and(eq(logs.timestamp, cursorTimestamp), gt(logs.id, cursorId))
          )
        );
      }
    }

    // Metadata filters - only check tracked metadata using JOIN
    const metadataFilters: Array<{ key: string; value: string }> = [];
    
    if (filters.metadata && filters.metadata.length > 0) {
      metadataFilters.push(...filters.metadata);
    }
    
    // Handle legacy metadata filtering
    if (filters.metaContains && Object.keys(filters.metaContains).length > 0) {
      Object.entries(filters.metaContains).forEach(([key, value]) => {
        metadataFilters.push({ key, value });
      });
    }

    // --- Subquery to get IDs and timestamps of `fetchLimitPlusOne` distinct logs ---
    let baseSubQuery = drizzle
      .selectDistinct({ id: logs.id, timestamp: logs.timestamp }) // timestamp for ordering
      .from(logs);

    // Add JOINs for metadata filtering
    if (metadataFilters.length > 0) {
      metadataFilters.forEach((meta, index) => {
        const logMetadataAlias = drizzle
          .select()
          .from(logMetadata)
          .as(`lm_filter_${index}`);
        const metadataAlias = drizzle
          .select()
          .from(metadata)
          .as(`m_filter_${index}`);
        
        baseSubQuery = baseSubQuery
          .innerJoin(
            logMetadataAlias,
            eq(logMetadataAlias.logId, logs.id)
          )
          .innerJoin(
            metadataAlias,
            and(
              eq(logMetadataAlias.metadataId, metadataAlias.id),
              eq(metadataAlias.key, meta.key),
              eq(metadataAlias.value, meta.value)
            )
          ) as any;
      });
    }

    // Apply conditions if any
    const conditionalSubQuery = allSubQueryConditions.length > 0
      ? baseSubQuery.where(and(...allSubQueryConditions))
      : baseSubQuery;

    const orderedAndLimitedLogIdsSubQuery = conditionalSubQuery
      .orderBy(
        sortDirection === 'desc' ? desc(logs.timestamp) : asc(logs.timestamp),
        sortDirection === 'desc' ? desc(logs.id) : asc(logs.id) // Tie-breaker for consistent ordering
      )
      .limit(fetchLimitPlusOne)
      .as('filtered_logs_subquery'); // Alias for the subquery

    // --- Main query to fetch full log data and their metadata for the selected IDs ---
    const fetchedLogEntries = await drizzle
      .select({
        log: logs,
        metadata: metadata,
      })
      .from(logs)
      .innerJoin(orderedAndLimitedLogIdsSubQuery, eq(logs.id, orderedAndLimitedLogIdsSubQuery.id))
      .leftJoin(logMetadata, eq(logs.id, logMetadata.logId))
      .leftJoin(metadata, eq(logMetadata.metadataId, metadata.id))
      .orderBy( // Order again based on the subquery's fields for consistency
        sortDirection === 'desc' ? desc(orderedAndLimitedLogIdsSubQuery.timestamp) : asc(orderedAndLimitedLogIdsSubQuery.timestamp),
        sortDirection === 'desc' ? desc(orderedAndLimitedLogIdsSubQuery.id) : asc(orderedAndLimitedLogIdsSubQuery.id)
      );

    // --- Process results ---
    const logsMap = new Map<string, Log>();
    fetchedLogEntries.forEach(row => {
      
      const { log, metadata: metadataRow } = row; // 'log' here is the full log record from the 'logs' table
      if (!logsMap.has(log.id)) {
        // Parse embedded metadata
        let embeddedMetadata: Record<string, string> = {};
        try {
          embeddedMetadata = JSON.parse(log.embeddedMetadata || '{}');
        } catch {
          embeddedMetadata = {};
        }

        // Convert embedded metadata to LogMetadata format
        const embeddedMetadataArray: LogMetadata[] = Object.entries(embeddedMetadata)
          .map(([key, value]) => ({ key, value }));

        logsMap.set(log.id, {
          id: log.id,
          projectId: log.projectId,
          level: log.level,
          message: log.message,
          timestamp: log.timestamp,
          metadata: [...embeddedMetadataArray] // Start with embedded metadata
        });
      }
      if (metadataRow) {
        // Add tracked metadata (union with embedded metadata)
        const currentLog = logsMap.get(log.id);
        if (currentLog) {
          // Check if this metadata key-value pair already exists to avoid duplicates
          const existingMeta = currentLog.metadata.find(m => m.key === metadataRow.key && m.value === metadataRow.value);
          if (!existingMeta) {
            currentLog.metadata.push({ key: metadataRow.key, value: metadataRow.value });
          }
        }
      }
    });

    const uniqueLogsRetrieved = Array.from(logsMap.values());

    // Determine if there's a next page
    const hasNextPage = uniqueLogsRetrieved.length > limit;

    // Return the first `limit` logs
    const logsToReturn = hasNextPage ? uniqueLogsRetrieved.slice(0, limit) : uniqueLogsRetrieved;

    return {
      logs: logsToReturn,
      hasNextPage,
    };
  }

  /**
   * Get metrics for a specific project
   * @param projectId The project ID to get metrics for
   */
  async getProjectMetrics(projectId: string): Promise<ProjectMetrics> {
    const drizzle = await db.getDrizzle();

    // Get today's date as ISO string at start of day
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartIso = todayStart.toISOString();

    // Calculate total logs count
    const totalLogsResult = await drizzle
      .select({ count: count() })
      .from(logs)
      .where(eq(logs.projectId, projectId));

    const totalLogs = totalLogsResult[0]?.count || 0;

    // Calculate today's logs count
    const todaysLogsResult = await drizzle
      .select({ count: count() })
      .from(logs)
      .where(
        and(
          eq(logs.projectId, projectId),
          sql`${logs.timestamp} >= ${todayStartIso}`
        )
      );

    const todaysLogs = todaysLogsResult[0]?.count || 0;

    // Calculate total info logs count
    const totalInfoResult = await drizzle
      .select({ count: count() })
      .from(logs)
      .where(
        and(
          eq(logs.projectId, projectId),
          eq(logs.level, 'info')
        )
      );

    const totalInfo = totalInfoResult[0]?.count || 0;

    // Calculate today's info logs count
    const todaysInfoResult = await drizzle
      .select({ count: count() })
      .from(logs)
      .where(
        and(
          eq(logs.projectId, projectId),
          eq(logs.level, 'info'),
          sql`${logs.timestamp} >= ${todayStartIso}`
        )
      );

    const todaysInfo = todaysInfoResult[0]?.count || 0;

    // Calculate total warn logs count
    const totalWarnResult = await drizzle
      .select({ count: count() })
      .from(logs)
      .where(
        and(
          eq(logs.projectId, projectId),
          eq(logs.level, 'warn')
        )
      );

    const totalWarn = totalWarnResult[0]?.count || 0;

    // Calculate today's warn logs count
    const todaysWarnResult = await drizzle
      .select({ count: count() })
      .from(logs)
      .where(
        and(
          eq(logs.projectId, projectId),
          eq(logs.level, 'warn'),
          sql`${logs.timestamp} >= ${todayStartIso}`
        )
      );

    const todaysWarn = todaysWarnResult[0]?.count || 0;

    // Calculate total errors count (logs with level 'error')
    const totalErrorsResult = await drizzle
      .select({ count: count() })
      .from(logs)
      .where(
        and(
          eq(logs.projectId, projectId),
          eq(logs.level, 'error')
        )
      );

    const totalErrors = totalErrorsResult[0]?.count || 0;

    // Calculate today's errors count
    const todaysErrorsResult = await drizzle
      .select({ count: count() })
      .from(logs)
      .where(
        and(
          eq(logs.projectId, projectId),
          eq(logs.level, 'error'),
          sql`${logs.timestamp} >= ${todayStartIso}`
        )
      );

    const todaysErrors = todaysErrorsResult[0]?.count || 0;

    // Get last activity (most recent log)
    const lastActivityResult = await drizzle
      .select({
        timestamp: logs.timestamp,
        message: logs.message,
        level: logs.level,
      })
      .from(logs)
      .where(eq(logs.projectId, projectId))
      .orderBy(desc(logs.timestamp))
      .limit(1);

    const lastActivity = lastActivityResult[0] || undefined;

    return {
      totalLogs,
      todaysLogs,
      totalInfo,
      todaysInfo,
      totalWarn,
      todaysWarn,
      totalErrors,
      todaysErrors,
      lastActivity,
    };
  }

  /**
   * Get historical log counts by day for the last 7 days
   * This is used for trend charts
   * @param projectId The project ID to get metrics for
   */
  async getHistoricalLogCounts(projectId: string, days: number = 7): Promise<Array<{
    date: string;
    info: number;
    warn: number;
    error: number;
    total: number;
  }>> {
    const drizzle = await db.getDrizzle();

    // Create today's date and reset to midnight for consistent date handling
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // Calculate end date - set to 23:59:59.999 of today
    const endDate = new Date(todayStr + 'T23:59:59.999Z');

    // Calculate start date - (days-1) days before today at 00:00:00
    const startDate = new Date(todayStr);
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    // Format as ISO strings for the query
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();


    // Get all logs in date range
    const result = await drizzle
      .select({
        timestamp: logs.timestamp,
        level: logs.level,
      })
      .from(logs)
      .where(
        and(
          eq(logs.projectId, projectId),
          sql`${logs.timestamp} >= ${startISO}`,
          sql`${logs.timestamp} <= ${endISO}`
        )
      );

    // Create a map to store counts by day
    const dayMap = new Map<string, { info: number; warn: number; error: number; total: number }>();

    // Initialize all days in range (including today) with zero counts
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format

      dayMap.set(dateKey, {
        info: 0,
        warn: 0,
        error: 0,
        total: 0
      });
    }

    // Explicitly ensure today is in the map (in case of timezone issues)
    if (!dayMap.has(todayStr)) {
      dayMap.set(todayStr, {
        info: 0,
        warn: 0,
        error: 0,
        total: 0
      });
    }

    // Count logs by day and level
    result.forEach(log => {
      // Extract YYYY-MM-DD from the timestamp
      const date = new Date(log.timestamp);
      const dateKey = date.toISOString().split('T')[0];

      if (dayMap.has(dateKey)) {
        const counts = dayMap.get(dateKey)!;
        counts.total++;

        // Increment the appropriate level counter
        if (log.level === 'info') counts.info++;
        else if (log.level === 'warn') counts.warn++;
        else if (log.level === 'error') counts.error++;
      }
    });


    // Convert map to array and sort by date
    return Array.from(dayMap.entries())
      .map(([date, counts]) => ({
        date,
        ...counts
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get all logs with their metadata using a JOIN
   * This is a convenience method that delegates to getLogsWithFilters
   */
  async getAllLogs(): Promise<Log[]> {
    const { logs } = await this.getLogsWithFilters({ projectId: '*' });
    return logs;
  }

  /**
   * Clear all logs for a specific project
   */
  async clearProjectLogs(projectId: string): Promise<void> {
    const drizzle = await db.getDrizzle();
    
    // Delete all logs for the project (metadata will be cascade deleted)
    await drizzle
      .delete(logs)
      .where(eq(logs.projectId, projectId));
    
    // Also delete any orphaned metadata entries for this project
    await drizzle
      .delete(metadata)
      .where(eq(metadata.projectId, projectId));
  }
}