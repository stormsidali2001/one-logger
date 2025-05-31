import { Span } from './span.js';
import type { TraceData } from '@one-logger/types';

export class Trace {
  public readonly id: string;
  public readonly spans: Span[] = [];
  public readonly startTime: number;
  public endTime?: number;
  public duration?: number;

  constructor(id: string, rootSpan?: Span) {
    this.id = id;
    this.startTime = performance.now();
    
    if (rootSpan) {
      this.spans.push(rootSpan);
    }
  }

  /**
   * Add a span to this trace
   */
  addSpan(span: Span): void {
    if (span.traceId !== this.id) {
      throw new Error(`Span trace ID ${span.traceId} does not match trace ID ${this.id}`);
    }
    
    this.spans.push(span);
  }

  /**
   * Get the root span (span with no parent)
   */
  getRootSpan(): Span | undefined {
    return this.spans.find(span => !span.parentSpanId);
  }

  /**
   * Get all child spans of a given span
   */
  getChildSpans(parentSpanId: string): Span[] {
    return this.spans.filter(span => span.parentSpanId === parentSpanId);
  }

  /**
   * Check if all spans in the trace are finished
   */
  isComplete(): boolean {
    return this.spans.length > 0 && this.spans.every(span => span.isFinished());
  }

  /**
   * Finish the trace (called when all spans are complete)
   */
  finish(): void {
    if (this.endTime !== undefined) {
      return;
    }

    if (!this.isComplete()) {
      console.warn(`Trace ${this.id} has unfinished spans`);
      return;
    }

    this.endTime = performance.now();
    this.duration = this.endTime - this.startTime;
  }

  /**
   * Get the total duration of the trace
   */
  getTotalDuration(): number {
    if (this.duration !== undefined) {
      return this.duration;
    }

    const rootSpan = this.getRootSpan();
    if (rootSpan && rootSpan.duration !== undefined) {
      return rootSpan.duration;
    }

    return 0;
  }

  /**
   * Convert trace to serializable data
   */
  toData(): TraceData {
    return {
      id: this.id,
      projectId: '', // Logger package doesn't track projectId
      name: '', // Logger package doesn't track name
      status: 'completed', // Default status
      metadata: {}, // Default empty metadata
      createdAt: new Date(this.startTime).toISOString(), // Use startTime as createdAt
      spans: this.spans.map(span => span.toData()),
      startTime: new Date(this.startTime).toISOString(),
      endTime: this.endTime ? new Date(this.endTime).toISOString() : undefined,
      duration: this.duration ? this.duration.toString() : undefined
    };
  }

  /**
   * Get a hierarchical representation of spans for debugging
   */
  getHierarchy(): string {
    const lines: string[] = [];
    const rootSpan = this.getRootSpan();
    
    if (rootSpan) {
      this.buildHierarchyLines(rootSpan, lines, 0);
    }
    
    return lines.join('\n');
  }

  private buildHierarchyLines(span: Span, lines: string[], depth: number): void {
    const indent = '  '.repeat(depth);
    const status = span.status === 'completed' ? '✓' : '✗';
    const duration = span.duration ? `(${span.duration.toFixed(1)}ms)` : '';
    const metadata = Object.keys(span.metadata).length > 0 
      ? ` metadata: ${JSON.stringify(span.metadata)}`
      : '';
    
    lines.push(`${indent}↳ ${span.name} ${status} ${duration}${metadata}`);
    
    const children = this.getChildSpans(span.id);
    children.forEach(child => {
      this.buildHierarchyLines(child, lines, depth + 1);
    });
  }
}