import { db } from '../db/db';
import { logs, logMetadata } from '../db/schema';
import { Log, LogMetadata, LogFilters, ProjectMetrics } from '../types/log';
import { eq, inArray, sql, and, or, like, gt, lt, desc, asc, count } from 'drizzle-orm';

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
    const { logs } = await this.getLogsWithFilters({ projectId });
    return logs;
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

    // Metadata filters using EXISTS (applied to the 'logs' table context in the subquery)
    if (filters.metadata && filters.metadata.length > 0) {
      filters.metadata.forEach(meta => {
        allSubQueryConditions.push(
          sql`EXISTS (
            SELECT 1 FROM ${logMetadata} AS lm_sub
            WHERE lm_sub.log_id = ${logs.id}
            AND lm_sub.key = ${meta.key}
            AND lm_sub.value = ${meta.value}
          )`
        );
      });
    }
    // Handle legacy metadata filtering
    if (filters.metaContains && Object.keys(filters.metaContains).length > 0) {
      Object.entries(filters.metaContains).forEach(([key, value]) => {
        allSubQueryConditions.push(
          sql`EXISTS (
                    SELECT 1 FROM ${logMetadata} AS lm_legacy_sub
                    WHERE lm_legacy_sub.log_id = ${logs.id}
                    AND lm_legacy_sub.key = ${key}
                    AND lm_legacy_sub.value = ${value}
                )`
        );
      });
    }

    // --- Subquery to get IDs and timestamps of `fetchLimitPlusOne` distinct logs ---
    const baseSubQuery = drizzle
      .selectDistinct({ id: logs.id, timestamp: logs.timestamp }) // timestamp for ordering
      .from(logs);

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
        meta: logMetadata,
      })
      .from(logs)
      .innerJoin(orderedAndLimitedLogIdsSubQuery, eq(logs.id, orderedAndLimitedLogIdsSubQuery.id))
      .leftJoin(logMetadata, eq(logs.id, logMetadata.logId))
      .orderBy( // Order again based on the subquery's fields for consistency
        sortDirection === 'desc' ? desc(orderedAndLimitedLogIdsSubQuery.timestamp) : asc(orderedAndLimitedLogIdsSubQuery.timestamp),
        sortDirection === 'desc' ? desc(orderedAndLimitedLogIdsSubQuery.id) : asc(orderedAndLimitedLogIdsSubQuery.id)
      );

    // --- Process results ---
    const logsMap = new Map<string, Log>();
    fetchedLogEntries.forEach(row => {
      const { log, meta } = row; // 'log' here is the full log record from the 'logs' table
      if (!logsMap.has(log.id)) {
        logsMap.set(log.id, {
          ...log, // Spread all fields from the fetched log
          timestamp: log.timestamp, // Ensure timestamp is correctly mapped if type differs
          metadata: []
        });
      }
      if (meta) {
        // Ensure metadata has the correct type if necessary
        const currentLog = logsMap.get(log.id);
        if (currentLog) {
          currentLog.metadata.push(meta as LogMetadata);
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

    console.log(`Fetching logs from ${startISO} to ${endISO}`);

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

    console.log('Days in map:', Array.from(dayMap.keys()));

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
}