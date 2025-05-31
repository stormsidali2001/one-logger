import type { SpanStatus, SpanMetadata, SpanData } from '@one-logger/types';

export class Span {
  public readonly id: string;
  public readonly traceId: string;
  public readonly parentSpanId?: string;
  public readonly name: string;
  public readonly startTime: number;
  public endTime?: number;
  public duration?: number;
  public metadata: SpanMetadata;
  public status: SpanStatus = 'running';
  public error?: Error;

  constructor(
    id: string,
    traceId: string,
    name: string,
    parentSpanId?: string,
    metadata: SpanMetadata = {}
  ) {
    this.id = id;
    this.traceId = traceId;
    this.parentSpanId = parentSpanId;
    this.name = name;
    this.startTime = performance.now();
    this.metadata = { ...metadata };
  }

  /**
   * Finish the span with optional status and error
   */
  finish(status: SpanStatus = 'completed', error?: Error): void {
    if (this.endTime !== undefined) {
      console.warn(`Span ${this.id} is already finished`);
      return;
    }

    this.endTime = performance.now();
    this.duration = this.endTime - this.startTime;
    this.status = status;
    
    if (error) {
      this.error = error;
      this.status = 'failed';
    }
  }

  /**
   * Add metadata to the span
   */
  addMetadata(key: string, value: any): void {
    this.metadata[key] = value;
  }

  /**
   * Set span status and optional error
   */
  setStatus(status: SpanStatus, error?: Error): void {
    this.status = status;
    if (error) {
      this.error = error;
    }
  }

  /**
   * Check if the span is finished
   */
  isFinished(): boolean {
    return this.endTime !== undefined;
  }

  /**
   * Convert span to serializable data
   */
  toData(): SpanData {
    return {
      id: this.id,
      traceId: this.traceId,
      parentSpanId: this.parentSpanId,
      name: this.name,
      startTime: new Date(this.startTime).toISOString(),
      endTime: this.endTime ? new Date(this.endTime).toISOString() : undefined,
      duration: this.duration ? this.duration.toString() : undefined,
      metadata: this.metadata,
      status: this.status,
      createdAt: new Date(this.startTime).toISOString(),
      error: this.error
    };
  }
}