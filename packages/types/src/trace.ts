import type { Status, Metadata, PaginationOptions } from './common.js';

// Span status type (alias for common Status)
export type SpanStatus = Status;

// Span metadata interface
export interface SpanMetadata extends Metadata {}

// Core span interface
export interface SpanData {
  id: string;
  traceId: string;
  parentSpanId?: string;
  name: string;
  startTime: string; // ISO date string for CLI app compatibility
  endTime?: string;
  duration?: string;
  status: SpanStatus;
  metadata: SpanMetadata;
  createdAt: string;
  error?: Error; // For logger package compatibility
  spans?: SpanData[];
}

// Core trace interface
export interface TraceData {
  id: string;
  projectId: string; // CLI app specific
  name: string; // CLI app specific
  startTime: string; // ISO date string for CLI app compatibility
  endTime?: string;
  duration?: string;
  status: Status; // CLI app specific
  metadata: Metadata;
  createdAt: string; // CLI app specific
  spans?: SpanData[]; // Optional for logger package compatibility
}

// Trace creation interface
export interface CreateTraceData {
  projectId: string;
  name: string;
  startTime: string;
  endTime?: string;
  metadata?: Metadata;
  spans?:CreateSpanData[];
}

// Span creation interface
export interface CreateSpanData {
  id:string;
  traceId: string;
  parentSpanId?: string;
  name: string;
  startTime: string;
  endTime?: string;
  metadata?: SpanMetadata;
}

// Trace update interface
export interface UpdateTraceData {
  endTime?: string;
  duration?: string;
  status?: Status;
  metadata?: Metadata;
}

// Span update interface
export interface UpdateSpanData {
  endTime?: string;
  duration?: string;
  status?: SpanStatus;
  metadata?: SpanMetadata;
}

// Trace with spans interface (for complete trace retrieval)
export interface TraceWithSpans {
  trace: TraceData;
  spans: SpanData[];
}

// Trace query options
export interface TraceQueryOptions extends PaginationOptions {}

// Span query options
export interface SpanQueryOptions extends PaginationOptions {}