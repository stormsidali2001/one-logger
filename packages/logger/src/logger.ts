import { LogCreate, LogLevel, LogMetadata } from './types/log';
import { LoggerOptions } from './types/logger-options';
import { LoggerTransport } from './types/transport';

export class Logger {
  private readonly projectId: string;
  private readonly transport: LoggerTransport;

  constructor(options: LoggerOptions) {
    this.projectId = options.projectId;
    this.transport = options.transport;
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
      projectId: this.projectId,
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };
  }

  async log(message: string, meta?: Record<string, unknown>): Promise<void> {
    await this.transport.send(this.makePayload('log', message, meta));
  }
  async info(message: string, meta?: Record<string, unknown>): Promise<void> {
    await this.transport.send(this.makePayload('info', message, meta));
  }
  async warn(message: string, meta?: Record<string, unknown>): Promise<void> {
    await this.transport.send(this.makePayload('warn', message, meta));
  }
  async error(message: string, meta?: Record<string, unknown>): Promise<void> {
    await this.transport.send(this.makePayload('error', message, meta));
  }
} 