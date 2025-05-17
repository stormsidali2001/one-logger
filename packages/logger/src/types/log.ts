export type LogLevel = 'log' | 'info' | 'warn' | 'error';

export interface LogMetadata {
  id?: string;
  logId?: string;
  key: string;
  value: string;
}

export interface Log {
  id: string;
  projectId: string;
  level: string;
  message: string;
  timestamp: string;
  metadata: LogMetadata[];
}

export interface LogCreate {
  projectId: string;
  level: string;
  message: string;
  timestamp: string;
  metadata: LogMetadata[];
} 

export interface LogFilters {
  limit?: string;
  sortDirection?: 'asc' | 'desc';
  fromDate?: string;
  toDate?: string;
  messageContains?: string;
  level?: string | string[];
}