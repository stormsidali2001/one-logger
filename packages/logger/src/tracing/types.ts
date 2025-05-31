export type SpanStatus = 'success' | 'error';

export interface SpanMetadata {
  [key: string]: any;
}

export interface TraceTransport {
  sendTraces(traces: TraceData[]): Promise<void>;
}

export interface TracingOptions {
  transport: TraceTransport;
  batchSize?: number;
  flushInterval?: number;
}

export interface SpanData {
  id: string;
  traceId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata: SpanMetadata;
  status: SpanStatus;
  error?: Error;
}

export interface TraceData {
  id: string;
  spans: SpanData[];
  startTime: number;
  endTime?: number;
  duration?: number;
}