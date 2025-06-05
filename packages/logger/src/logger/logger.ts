import type { LogCreate, LogLevel, LogMetadata } from '../types/log';
import type { LoggerOptions } from '../types/logger-options';
import type { LoggerTransport } from '../types/transport';

interface QueuedLog {
  payload: LogCreate;
  retryAt: number;
  retried: boolean;
}

interface BatchedLog {
  payload: LogCreate;
  timestamp: number;
}

export class Logger {
  private static readonly RETRY_DELAY_MS = 5000; // 5 seconds
  private static readonly QUEUE_PROCESS_INTERVAL_MS = 1000; // 1 second
  private static readonly DEFAULT_BATCH_SIZE = 10;
  private static readonly DEFAULT_FLUSH_INTERVAL_MS = 5000; // 5 seconds

  private _projectId?: string;
  private _transport?: LoggerTransport;
  private _logQueue: QueuedLog[] = [];
  private _isProcessingQueue = false;
  private _batchQueue: BatchedLog[] = [];
  private _batchSize: number;
  private _flushInterval: number;
  private _flushTimer?: NodeJS.Timeout;
  private _isProcessingBatch = false;

  constructor(options?: Partial<LoggerOptions & { batchSize?: number; flushInterval?: number }>) {
    this._projectId = options?.projectId;
    this._transport = options?.transport;
    this._batchSize = options?.batchSize ?? Logger.DEFAULT_BATCH_SIZE;
    this._flushInterval = options?.flushInterval ?? Logger.DEFAULT_FLUSH_INTERVAL_MS;
  }

  set projectId(id: string | undefined) {
    this._projectId = id;
  }
  get projectId(): string | undefined {
    return this._projectId;
  }

  set transport(transport: LoggerTransport | undefined) {
    this._transport = transport;
  }
  get transport(): LoggerTransport | undefined {
    return this._transport;
  }

  private makePayload(level: LogLevel, message: string, meta?: Record<string, unknown>): LogCreate {
    // Convert metadata object into array of key-value pairs for the API
    const metadata: LogMetadata[] = meta
      ? Object.entries(meta).map(([key, value]) => ({
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value)
      }))
      : [];

    return {
      projectId: this._projectId ?? '',
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };
  }

  private addToBatch(payload: LogCreate): void {
    if (!this._projectId || !this._transport) {
      console.warn('[logs-collector] Logger not initialized. Call initializeLogger first.');
      return;
    }

    this._batchQueue.push({
      payload,
      timestamp: Date.now()
    });

    // Flush if batch size is reached
    if (this._batchQueue.length >= this._batchSize) {
      this.flushBatch();
    } else {
      // Schedule flush if not already scheduled
      this.scheduleFlush();
    }
  }

  private scheduleFlush(): void {
    if (this._flushTimer) {
      return; // Already scheduled
    }

    this._flushTimer = setTimeout(() => {
      this.flushBatch();
    }, this._flushInterval);
  }

  private async flushBatch(): Promise<void> {
    if (this._isProcessingBatch || this._batchQueue.length === 0) {
      return;
    }

    // Clear the flush timer
    if (this._flushTimer) {
      clearTimeout(this._flushTimer);
      this._flushTimer = undefined;
    }

    this._isProcessingBatch = true;
    const logsToSend = [...this._batchQueue];
    this._batchQueue = [];

    try {
      if (this._transport && this._transport.sendBulk) {
        // Use bulk transport if available
        await this._transport.sendBulk(logsToSend.map(item => item.payload));
      } else {
        // Fallback to individual sends
        for (const logItem of logsToSend) {
          try {
            if (this._transport) {
              await this._transport.send(logItem.payload);
            }
          } catch (error) {
            // Queue failed logs for retry
            this._logQueue.push({
              payload: logItem.payload,
              retryAt: Date.now() + Logger.RETRY_DELAY_MS,
              retried: false
            });
          }
        }

        // Start processing retry queue if needed
        if (this._logQueue.length > 0 && !this._isProcessingQueue) {
          this.processQueue();
        }
      }
    } catch (error) {
      // If bulk send fails, queue all logs for retry
      for (const logItem of logsToSend) {
        this._logQueue.push({
          payload: logItem.payload,
          retryAt: Date.now() + Logger.RETRY_DELAY_MS,
          retried: false
        });
      }

      console.warn(
        `[logs-collector] Failed to send batch of ${logsToSend.length} logs, queued for retry. Error:`,
        error instanceof Error ? error.message : String(error)
      );

      // Start processing retry queue
      if (!this._isProcessingQueue) {
        this.processQueue();
      }
    } finally {
      this._isProcessingBatch = false;
    }
  }

  private async processQueue(): Promise<void> {
    if (this._isProcessingQueue || this._logQueue.length === 0) {
      return;
    }

    this._isProcessingQueue = true;

    try {
      const now = Date.now();
      const readyLogs = this._logQueue.filter(item => !item.retried && item.retryAt <= now);

      // Process all logs ready for retry
      if (readyLogs.length > 0 && this._transport) {
        try {
          if (this._transport.sendBulk && readyLogs.length > 1) {
            // Use bulk transport for multiple logs
            await this._transport.sendBulk(readyLogs.map(item => item.payload));
            // Mark all as processed
            readyLogs.forEach(item => {
              item.retried = true;
            });
          } else {
            // Process individually
            for (const logItem of readyLogs) {
              try {
                await this._transport.send(logItem.payload);
                // Mark as processed
                logItem.retried = true;
              } catch (error) {
                // Mark as retried anyway - we only retry once
                logItem.retried = true;
                console.warn(
                  `[logs-collector] Retry failed for log. Error:`,
                  error instanceof Error ? error.message : String(error)
                );
              }
            }
          }
        } catch (error) {
          // Mark all as retried if bulk operation fails
          readyLogs.forEach(item => {
            item.retried = true;
          });
          console.warn(
            `[logs-collector] Bulk retry failed for ${readyLogs.length} logs. Error:`,
            error instanceof Error ? error.message : String(error)
          );
        }
      }

      // Clean up retried logs
      this._logQueue = this._logQueue.filter(item => !item.retried);

      // Schedule next check if there are still items in the queue
      if (this._logQueue.length > 0) {
        setTimeout(() => this.processQueue(), Logger.QUEUE_PROCESS_INTERVAL_MS);
      } else {
        this._isProcessingQueue = false;
      }
    } catch (error) {
      console.error('[logs-collector] Error processing log queue:', error);
      this._isProcessingQueue = false;

      // Retry processing after a delay
      if (this._logQueue.length > 0) {
        setTimeout(() => this.processQueue(), Logger.QUEUE_PROCESS_INTERVAL_MS);
      }
    }
  }

  async log(message: string, meta?: Record<string, unknown>): Promise<void> {
    this.addToBatch(this.makePayload('log', message, meta));
  }

  async info(message: string, meta?: Record<string, unknown>): Promise<void> {
    this.addToBatch(this.makePayload('info', message, meta));
  }

  async warn(message: string, meta?: Record<string, unknown>): Promise<void> {
    this.addToBatch(this.makePayload('warn', message, meta));
  }

  async error(message: string, meta?: Record<string, unknown>): Promise<void> {
    this.addToBatch(this.makePayload('error', message, meta));
  }

  async debug(message: string, meta?: Record<string, unknown>): Promise<void> {
    this.addToBatch(this.makePayload('debug', message, meta));
  }

  /**
   * Manually flush any pending logs in the batch queue
   */
  async flush(): Promise<void> {
    await this.flushBatch();
  }

  /**
   * Configure batch settings
   */
  setBatchConfig(batchSize: number, flushInterval: number): void {
    this._batchSize = batchSize;
    this._flushInterval = flushInterval;
  }
  
  /**
   * Cleanup method to clear timers and flush pending logs
   */
  async cleanup(): Promise<void> {
    if (this._flushTimer) {
      clearTimeout(this._flushTimer);
      this._flushTimer = undefined;
    }
    await this.flushBatch();
  }
}