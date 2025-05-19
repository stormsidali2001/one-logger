import type { LogCreate, LogLevel, LogMetadata } from './types/log';
import type { LoggerOptions } from './types/logger-options';
import type { LoggerTransport } from './types/transport';

export class Logger {
  private _projectId?: string;
  private _transport?: LoggerTransport;

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

  async log(message: string, meta?: Record<string, unknown>): Promise<void> {
    if (!this._projectId || !this._transport) {
      console.warn('[logs-collector] Logger not initialized. Call initializeLogger first.');
      return;
    }
    await this._transport.send(this.makePayload('log', message, meta));
  }
  async info(message: string, meta?: Record<string, unknown>): Promise<void> {
    if (!this._projectId || !this._transport) {
      console.warn('[logs-collector] Logger not initialized. Call initializeLogger first.');
      return;
    }
    await this._transport.send(this.makePayload('info', message, meta));
  }
  async warn(message: string, meta?: Record<string, unknown>): Promise<void> {
    if (!this._projectId || !this._transport) {
      console.warn('[logs-collector] Logger not initialized. Call initializeLogger first.');
      return;
    }
    await this._transport.send(this.makePayload('warn', message, meta));
  }
  async error(message: string, meta?: Record<string, unknown>): Promise<void> {
    if (!this._projectId || !this._transport) {
      console.warn('[logs-collector] Logger not initialized. Call initializeLogger first.');
      return;
    }
    await this._transport.send(this.makePayload('error', message, meta));
  }
} 