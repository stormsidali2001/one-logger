export interface Log {
  id: string;
  projectId: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  metadata?: Record<string, any>;
  timestamp: string;
  updatedAt: string;
}

export interface CreateLogData {
  projectId: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  metadata?: Record<string, any>;
}

export interface PaginationOptions {
  limit?: number;
  cursor?: {id: string, timestamp: string};
  sortDirection?: 'asc' | 'desc';
}

export interface LogCursor {
  id: string;
  timestamp: string;
}