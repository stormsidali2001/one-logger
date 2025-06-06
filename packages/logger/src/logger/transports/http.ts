import { sdk } from '../../sdk.js';
import type { LoggerTransport, LogCreate } from '../../types';
import { serializeError } from 'serialize-error';

export class HttpLoggerTransport implements LoggerTransport {
  constructor() {}

  private processMetadata(payload: LogCreate): LogCreate {
    if (!payload.metadata || payload.metadata.length === 0) {
      return payload;
    }

    const processedMetadata = payload.metadata.map(meta => {
      try {
        // Try to parse the value to check if it's a serialized object
        const parsedValue = JSON.parse(meta.value);
        
        // If it's an Error object (has name, message, stack properties)
        if (parsedValue && typeof parsedValue === 'object' && 
            parsedValue.name && parsedValue.message && parsedValue.stack) {
          // Re-serialize using serialize-error for better error handling
          return {
            ...meta,
            value: JSON.stringify(serializeError(parsedValue))
          };
        }
        
        return meta;
      } catch {
        // If JSON.parse fails, the value is likely a plain string
        return meta;
      }
    });

    return {
      ...payload,
      metadata: processedMetadata
    };
  }

  async send(payload: LogCreate): Promise<void> {
    const processedPayload = this.processMetadata(payload);
    await sdk.logs.create(processedPayload);
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

    // Process all payloads for metadata handling
    const processedPayloads = payloads.map(payload => this.processMetadata(payload));
    
    // Use bulk create for multiple logs
    await sdk.logs.bulkCreate(processedPayloads);
  }
}