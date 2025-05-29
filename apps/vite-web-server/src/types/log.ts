export interface Log {
  id: string;
  projectId: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  metadata?: Record<string, any>;
  createdAt: string;
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
  cursor?: string;
  sortDirection?: 'asc' | 'desc';
}