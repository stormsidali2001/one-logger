import type { TraceData, SpanData, TraceTransport } from '@one-logger/types';

/**
 * Console transport for outputting traces to console during development
 */
export class ConsoleTraceTransport implements TraceTransport {
  public readonly name = 'console';
  private readonly prefix: string;

  constructor(prefix = '[TRACE]') {
    this.prefix = prefix;
  }

  async sendTraces(traces: TraceData[]): Promise<void> {
    for (const trace of traces) {
      this.logTrace(trace);
    }
  }

  private logTrace(trace: TraceData): void {
    const duration = trace.duration ? parseFloat(trace.duration) : 0;
    console.group(`${this.prefix} Trace ${trace.id} (${duration.toFixed(1)}ms)`);
    
    // Log trace hierarchy
    const hierarchy = this.buildHierarchy(trace);
    if (hierarchy) {
      console.log(hierarchy);
    }

    // Log detailed span information
    console.groupCollapsed('Detailed Span Information');
    trace.spans?.forEach(span => {
      console.log(`Span: ${span.name}`, {
        id: span.id,
        duration: span.duration,
        status: span.status,
        metadata: span.metadata,
        error: span.error
      });
    });
    console.groupEnd();

    console.groupEnd();
  }

  private buildHierarchy(trace: TraceData): string {
    const lines: string[] = [];
    const rootSpan = trace.spans?.find(span => !span.parentSpanId);
    if (rootSpan && trace.spans) {
      this.buildHierarchyLines(rootSpan, trace.spans, lines, 0);
    }
    
    return lines.join('\n');
  }

  private buildHierarchyLines(span: SpanData, allSpans: SpanData[], lines: string[], depth: number): void {
    const indent = '  '.repeat(depth);
    const status = span.status === 'completed' ? '✓' : '✗';
    const duration = span.duration ? `(${parseFloat(span.duration).toFixed(1)}ms)` : '';
    const metadata = Object.keys(span.metadata).length > 0 
      ? ` metadata: ${JSON.stringify(span.metadata)}`
      : '';
    
    lines.push(`${indent}↳ ${span.name} ${status} ${duration}${metadata}`);
    
    const children = allSpans.filter(s => s.parentSpanId === span.id);
    children.forEach(child => {
      this.buildHierarchyLines(child, allSpans, lines, depth + 1);
    });
  }
}