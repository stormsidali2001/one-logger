import type { TraceData, Log, LogCreate } from './index.js';

// Base transport interface
export interface Transport {
  name: string;
}

export interface LoggerTransport {
  send(log: LogCreate): Promise<void>;
  sendBulk?(logs: LogCreate[]): Promise<void>;
}

export interface TraceTransport extends Transport {
  sendTraces(traces: TraceData[]): Promise<void>;
}

export interface TracingOptions {
  transport: TraceTransport;
  batchSize?: number;
  flushInterval?: number;
}

// Logger options interface
export interface LoggerOptions {
  projectId: string;
  transport: LoggerTransport;
}