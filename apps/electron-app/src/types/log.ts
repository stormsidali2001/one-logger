export interface Log {
  id: string;
  projectId: string;
  level: string;
  message: string;
  timestamp: string; // ISO date string
  metadata: LogMetadata[];
}

export interface LogMetadata {
  id?: string;
  logId?: string;
  key: string;
  value: string;
}

export interface LogCursor {
  id: string;
  timestamp: string;
}

export interface LogFilters {
  projectId: string;
  level?: string | string[];
  messageContains?: string;
  fromDate?: string | Date;
  toDate?: string | Date;
  metaContains?: Record<string, string>;
  limit?: number;
  cursor?: LogCursor;
  sortDirection?: 'asc' | 'desc';
} 