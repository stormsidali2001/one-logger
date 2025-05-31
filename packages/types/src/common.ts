// Common status types
export type Status = 'running' | 'completed' | 'failed';

// Common metadata interface
export interface Metadata {
  [key: string]: any;
}

// Common cursor interface for pagination
export interface Cursor {
  id: string;
  timestamp: string;
}

// Common pagination options
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  sortDirection?: 'asc' | 'desc';
}

// Common filter interface
export interface MetadataFilter {
  key: string;
  value: string;
}