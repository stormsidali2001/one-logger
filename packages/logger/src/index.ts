// LoggerOptions: configuration for the logger
export interface LoggerOptions {
  projectId: string;
  endpoint: string; // e.g. http://localhost:PORT/api/logs
}

// LogLevel: allowed log levels
export type LogLevel = 'log' | 'info' | 'warn' | 'error';

// LogPayload: matches the Electron app's log schema
export interface LogPayload {
  projectId: string;
  level: LogLevel;
  message: string;
  timestamp: string; // ISO string
  meta?: Record<string, unknown>;
}

export class Logger {
  private readonly projectId: string;
  private readonly endpoint: string;

  constructor(options: LoggerOptions) {
    this.projectId = options.projectId;
    this.endpoint = options.endpoint;
  }

  private async send(payload: LogPayload): Promise<void> {
    await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  private makePayload(level: LogLevel, message: string, meta?: Record<string, unknown>): LogPayload {
    return {
      projectId: this.projectId,
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(meta ? { meta } : {}),
    };
  }

  async log(message: string, meta?: Record<string, unknown>): Promise<void> {
    await this.send(this.makePayload('log', message, meta));
  }
  async info(message: string, meta?: Record<string, unknown>): Promise<void> {
    await this.send(this.makePayload('info', message, meta));
  }
  async warn(message: string, meta?: Record<string, unknown>): Promise<void> {
    await this.send(this.makePayload('warn', message, meta));
  }
  async error(message: string, meta?: Record<string, unknown>): Promise<void> {
    await this.send(this.makePayload('error', message, meta));
  }
} 