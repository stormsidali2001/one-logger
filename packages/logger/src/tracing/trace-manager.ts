import { Span } from './span.js';
import { Trace } from './trace.js';
import type { SpanMetadata, TraceTransport, TracingOptions } from '@notjustcoders/one-logger-types';

export class TraceManager {
  private static instance: TraceManager;
  private spanStack: Span[] = [];
  private activeTraces = new Map<string, Trace>();
  private completedTraces: Trace[] = [];
  private transport?: TraceTransport;
  private batchSize = 10;
  private flushInterval = 5000; // 5 seconds
  private flushTimer?: any;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): TraceManager {
    if (!TraceManager.instance) {
      TraceManager.instance = new TraceManager();
    }
    return TraceManager.instance;
  }

  /**
   * Initialize the trace manager with options
   */
  initialize(options: TracingOptions): void {
    this.transport = options.transport;
    this.batchSize = options.batchSize ?? 10;
    this.flushInterval = options.flushInterval ?? 5000;

    // Start the flush timer
    this.startFlushTimer();
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Start a new span
   */
  startSpan(name: string, metadata?: SpanMetadata): Span {
    const currentSpan = this.getCurrentSpan();
    const traceId = currentSpan?.traceId ?? this.generateId();
    const spanId = this.generateId();
    const parentSpanId = currentSpan?.id;

    const span = new Span(spanId, traceId, name, parentSpanId, metadata);

    // Add to span stack
    this.spanStack.push(span);

    // Get or create trace
    let trace = this.activeTraces.get(traceId);
    if (!trace) {
      trace = new Trace(traceId, span);
      this.activeTraces.set(traceId, trace);
    } else {
      trace.addSpan(span);
    }

    return span;
  }

  /**
   * Finish a span
   */
  finishSpan(span: Span): void {
    // Remove from span stack - handle both direct removal and cleanup of orphaned spans
    const index = this.spanStack.findIndex(s => s.id === span.id);
    if (index !== -1) {
      // Remove the span and any spans that were started after it but not properly finished
      // This helps prevent orphaned spans in async scenarios
      this.spanStack.splice(index, this.spanStack.length - index);
    }

    // Finish the span if not already finished
    if (!span.isFinished()) {
      span.finish();
    }

    // Check if trace is complete
    const trace = this.activeTraces.get(span.traceId);
    if (trace && trace.isComplete()) {
      trace.finish();
      this.activeTraces.delete(span.traceId);
      this.completedTraces.push(trace);

      // Auto-flush if batch size reached
      if (this.completedTraces.length >= this.batchSize) {
        this.flush();
      }
    }
  }

  /**
   * Get the current active span
   */
  getCurrentSpan(): Span | null {
    return this.spanStack[this.spanStack.length - 1] || null;
  }

  /**
   * Get the current trace
   */
  getCurrentTrace(): Trace | null {
    const currentSpan = this.getCurrentSpan();
    if (!currentSpan) return null;
    
    return this.activeTraces.get(currentSpan.traceId) || null;
  }

  /**
   * Get a specific trace by ID
   */
  getTrace(traceId: string): Trace | null {
    return this.activeTraces.get(traceId) || 
           this.completedTraces.find(trace => trace.id === traceId) || 
           null;
  }

  /**
   * Get all active traces
   */
  getAllActiveTraces(): Trace[] {
    return Array.from(this.activeTraces.values());
  }

  /**
   * Get all completed traces
   */
  getAllCompletedTraces(): Trace[] {
    return [...this.completedTraces];
  }

  /**
   * Clear completed traces
   */
  clearCompletedTraces(): void {
    this.completedTraces = [];
  }

  /**
   * Submit a trace to the transport
   */
  submitTrace(trace: Trace): void {
    if (!trace.isComplete()) {
      console.warn(`Trace ${trace.id} is not complete`);
      return;
    }

    this.completedTraces.push(trace);

    // Auto-flush if batch size reached
    if (this.completedTraces.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Force flush all pending traces
   */
  async flush(): Promise<void> {
    if (!this.transport || this.completedTraces.length === 0) {
      return;
    }

    const tracesToSend = [...this.completedTraces];
    this.completedTraces = [];

    try {
      const traceData = tracesToSend.map(trace => trace.toData());
      await this.transport.sendTraces(traceData);
    } catch (error) {
      console.error('Failed to send traces:', error);
      // Re-add traces back to the queue for retry
      this.completedTraces.unshift(...tracesToSend);
    }
  }

  /**
   * Start the automatic flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
      this.cleanupOrphanedSpans();
    }, this.flushInterval);
  }

  /**
   * Stop the flush timer
   */
  stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * Clean up orphaned spans that may have been left in the stack
   */
  cleanupOrphanedSpans(): void {
    const now = performance.now();
    const maxSpanAge = 30000; // 30 seconds
    
    // Remove spans that are older than maxSpanAge
    this.spanStack = this.spanStack.filter(span => {
      const spanAge = now - span.startTime;
      if (spanAge > maxSpanAge) {
        console.warn(`Cleaning up orphaned span: ${span.name} (age: ${spanAge}ms)`);
        return false;
      }
      return true;
    });
  }

  /**
   * Get debug information about the current state
   */
  getDebugInfo() {
    return {
      activeSpans: this.spanStack.length,
      activeTraces: this.activeTraces.size,
      completedTraces: this.completedTraces.length,
      currentSpan: this.getCurrentSpan()?.name || null,
      currentTrace: this.getCurrentTrace()?.id || null,
      spanStack: this.spanStack.map(span => ({
        id: span.id,
        name: span.name,
        startTime: span.startTime,
        age: performance.now() - span.startTime
      }))
    };
  }
}

// Export singleton instance
export const traceManager = TraceManager.getInstance();