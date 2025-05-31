import type { Cursor, MetadataFilter, Metadata } from './common.js';

// Log metadata interface
export interface LogMetadata {
  id?: string;
  logId?: string;
  key: string;
  value: string;
}

// Core log interface
export interface Log {
  id: string;
  projectId: string;
  level: string;
  message: string;
  timestamp: string; // ISO date string
  metadata: LogMetadata[];
}

// Log creation interface
export interface LogCreate {
  projectId: string;
  level: string;
  message: string;
  timestamp: string;
  metadata?: LogMetadata[];
}

// Log cursor for pagination
export interface LogCursor extends Cursor {}

// Log filters interface
export interface LogFilters {
  projectId?: string;
  level?: string | string[];
  messageContains?: string;
  fromDate?: string | Date;
  toDate?: string | Date;
  metaContains?: Record<string, string>;
  metadata?: MetadataFilter[];
  limit?: number;
  cursor?: LogCursor;
  sortDirection?: 'asc' | 'desc';
}

// Log pagination parameters
export interface LogPaginationParams {
  limit?: string;
  cursor?: LogCursor;
  sortDirection?: 'asc' | 'desc';
}