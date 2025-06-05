import { sdk } from '../../sdk.js';
import type { LoggerTransport, LogCreate } from '../../types';

export class HttpLoggerTransport implements LoggerTransport {
  constructor() {}

  async send(payload: LogCreate): Promise<void> {
    await sdk.logs.create(payload);
  }

  async sendBulk(payloads: LogCreate[]): Promise<void> {
    if (payloads.length === 0) {
      return;
    }
    
    if (payloads.length === 1) {
      // Use single create for single log
      await this.send(payloads[0]);
      return;
    }

    // Use bulk create for multiple logs
    await sdk.logs.bulkCreate(payloads);
  }
}