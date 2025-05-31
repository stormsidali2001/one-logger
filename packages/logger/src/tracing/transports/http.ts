import type { TraceData, TraceTransport } from '@one-logger/types';

/**
 * HTTP transport for sending traces to a backend server
 */
export class HttpTraceTransport implements TraceTransport {
  public readonly name = 'http';
  private readonly endpoint: string;
  private readonly headers: Record<string, string>;

  constructor(endpoint: string, headers: Record<string, string> = {}) {
    this.endpoint = endpoint;
    this.headers = {
      'Content-Type': 'application/json',
      ...headers
    };
  }

  async sendTraces(traces: TraceData[]): Promise<void> {
    if (traces.length === 0) {
      return;
    }

    const payload = {
      traces: traces,
      timestamp: new Date().toISOString(),
      count: traces.length
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send traces to HTTP endpoint:', error);
      throw error;
    }
  }
}