import type { LogCreate, LogLevel, LogMetadata } from '../types/log';
import type { LoggerOptions } from '../types/logger-options';
import type { LoggerTransport } from '../types/transport';

interface QueuedLog {
  payload: LogCreate;
  retryAt: number;
  retried: boolean;
}

export class Logger {
  private static readonly RETRY_DELAY_MS = 10000; // 10 seconds
  private static readonly QUEUE_PROCESS_INTERVAL_MS = 1000; // 1 second

  private _projectId?: string;
  private _transport?: LoggerTransport;
  private _logQueue: QueuedLog[] = [];
  private _isProcessingQueue = false;

  constructor(options?: Partial<LoggerOptions>) {
    this._projectId = options?.projectId;
    this._transport = options?.transport;
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

  private async sendWithRetry(payload: LogCreate): Promise<void> {
    if (!this._projectId || !this._transport) {
      console.warn('[logs-collector] Logger not initialized. Call initializeLogger first.');
      return;
    }

    try {
      await this._transport.send(payload);
    } catch (error) {
      // If send fails, queue it for retry
      this._logQueue.push({
        payload,
        retryAt: Date.now() + Logger.RETRY_DELAY_MS,
        retried: false
      });

      console.warn(
        `[logs-collector] Failed to send log, queued for retry in ${Logger.RETRY_DELAY_MS / 1000}s. Error:`,
        error instanceof Error ? error.message : String(error)
      );

      // Start processing the queue if not already processing
      if (!this._isProcessingQueue) {
        this.processQueue();
      }
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
      for (const logItem of readyLogs) {
        try {
          if (this._transport) {
            await this._transport.send(logItem.payload);
            // Mark as processed (will be removed in the cleanup)
            logItem.retried = true;
          }
        } catch (error) {
          // Mark as retried anyway - we only retry once
          logItem.retried = true;
          console.warn(
            `[logs-collector] Retry failed for log. Error:`,
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
    await this.sendWithRetry(this.makePayload('log', message, meta));
  }

  async info(message: string, meta?: Record<string, unknown>): Promise<void> {
    await this.sendWithRetry(this.makePayload('info', message, meta));
  }

  async warn(message: string, meta?: Record<string, unknown>): Promise<void> {
    await this.sendWithRetry(this.makePayload('warn', message, meta));
  }

  async error(message: string, meta?: Record<string, unknown>): Promise<void> {
    await this.sendWithRetry(this.makePayload('error', message, meta));
  }
  async debug(message: string, meta?: Record<string, unknown>): Promise<void> {
    await this.sendWithRetry(this.makePayload('debug', message, meta));
  }
  

}