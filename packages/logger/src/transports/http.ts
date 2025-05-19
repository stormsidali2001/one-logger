import type { LoggerTransport } from '../types/transport';
import type { LogCreate } from '../types/log';

export class HttpLoggerTransport implements LoggerTransport {
  constructor(private readonly endpoint: string) {}

  async send(payload: LogCreate): Promise<void> {
    await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
  }
} 