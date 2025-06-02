import { sdk } from '../../sdk.js';
import type { LoggerTransport, LogCreate } from '../../types';

export class HttpLoggerTransport implements LoggerTransport {
  constructor() {}

  async send(payload: LogCreate): Promise<void> {
      await sdk.logs.create(payload)
  }
}