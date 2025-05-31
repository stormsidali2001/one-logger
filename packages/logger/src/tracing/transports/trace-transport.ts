import type { TraceData } from '../types';

/**
 * Abstract interface for submitting traces to different backends
 */
export interface TraceTransport {
  sendTraces(traces: TraceData[]): Promise<void>;
}