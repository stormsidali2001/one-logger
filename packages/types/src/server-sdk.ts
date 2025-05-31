// Server SDK specific types
import type { LogMetadata, LogCursor } from './log.js';
import type { TraceData, SpanData } from './trace.js';
import type { MetadataFilter } from './common.js';

// Configuration types
export interface ConfigValue {
  key: string;
  value: any;
}

export interface SetConfigData {
  value: any;
}

// Server management types
export interface ServerLogsOptions {
  type?: 'stdout' | 'stderr' | 'all';
}

export interface ServerLogs {
  stdout: string[];
  stderr: string[];
}

// Project management types
export interface ProjectCreateData {
  name: string;
  description?: string;
}

export interface ProjectUpdateData {
  name?: string;
  description?: string;
}

// Log management types
export interface LogCreateData {
  projectId: string;
  level: string;
  message: string;
  timestamp: string;
  metadata?: LogMetadata[];
}

// Note: LogPaginationParams is defined in log.ts

// Options interfaces for various operations
export interface LogsOptions {
  limit?: number;
  offset?: number;
  cursor?: LogCursor;
  sortDirection?: 'asc' | 'desc';
  level?: string;
  messageContains?: string;
  fromDate?: string;
  toDate?: string;
  metaContains?: Record<string, string>;
  metadata?: MetadataFilter[];
}

export interface TracesOptions {
  limit?: number;
  offset?: number;
  sortDirection?: 'asc' | 'desc';
}

export interface HistoricalCountsOptions {
  days?: number;
}

// Trace and Span creation/update types (aliases to existing types)
export interface TraceCreateData {
  projectId: string;
  name: string;
  startTime: string;
  metadata?: Record<string, any>;
}

export interface TraceUpdateData {
  endTime?: string;
  duration?: string;
  status?: string;
  metadata?: Record<string, any>;
}

export interface SpanCreateData {
  traceId: string;
  parentSpanId?: string;
  name: string;
  startTime: string;
  metadata?: Record<string, any>;
}

export interface SpanUpdateData {
  endTime?: string;
  duration?: string;
  status?: string;
  metadata?: Record<string, any>;
}

// Note: TraceWithSpans is defined in trace.ts