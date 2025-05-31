import type { TraceData, Log, LogCreate } from './index.js';

// Base transport interface
export interface Transport {
  name: string;
}

// Logger transport interface
export interface LoggerTransport {
  send(log: LogCreate): Promise<void>;
}

// Trace transport interface
export interface TraceTransport extends Transport {
  sendTraces(traces: TraceData[]): Promise<void>;
}

// Tracing options interface
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