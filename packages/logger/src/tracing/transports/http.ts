import type { TraceData, TraceTransport } from '@notjustcoders/one-logger-types';
import { sdk } from '../../sdk.js';
import { error } from 'console';

import { serializeError } from 'serialize-error';
/**
 * HTTP transport for sending traces to a backend server using the One Logger SDK
 */
export class HttpTraceTransport implements TraceTransport {
  public readonly name = 'http';
  private readonly projectId: string;

  constructor(projectId: string) {
    this.projectId = projectId;
  }

  async sendTraces(traces: TraceData[]): Promise<void> {
    if (traces.length === 0) {
      return;
    }

    try {
      // Convert TraceData to TraceCreateData format for bulk creation
      const traceCreateData = traces.map(trace => ({
        projectId: this.projectId,
        name: trace.name,
        startTime: trace.startTime,
        endTime: trace.endTime,
        duration: trace.duration,
        status: trace.status,
        metadata: trace.metadata || {},
        spans: trace.spans?.map(span => ({
          parentSpanId: span.parentSpanId,
          id:span.id,
          name: span.name,
          startTime: span.startTime,
          endTime: span.endTime,
          duration: span.duration,
          error: span.error ? serializeError(span.error):span.error,
          status: span.status,
          metadata: span.metadata || {}
        })) || []
      }));

      // Use the optimized bulk creation method
      const result = await sdk.traces.bulkCreate(traceCreateData);
      
      if (!result.success) {
        throw new Error(`Bulk trace creation failed. Expected ${traces.length} traces, created ${result.count}`);
      }
    } catch (error) {
      console.error('Failed to send traces using bulk SDK method:', error);
      throw error;
    }
  }
}