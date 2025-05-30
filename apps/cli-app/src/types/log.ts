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

// Project configuration interface
export interface ProjectConfig {
  trackedMetadataKeys?: string[]; // Metadata keys that should be stored in the logMetadata table
  [key: string]: any; // Allow for additional configuration options
}

// Project interface
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  config: ProjectConfig;
}

// Interface for metadata filters
export interface MetadataFilter {
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
  metadata?: MetadataFilter[]; // Add the new metadata filter format
  limit?: number;
  cursor?: LogCursor;
  sortDirection?: 'asc' | 'desc';
}

// Project metrics interface
export interface ProjectMetrics {
  totalLogs: number;
  todaysLogs: number;
  totalInfo: number;
  todaysInfo: number;
  totalWarn: number;
  todaysWarn: number;
  totalErrors: number;
  todaysErrors: number;
  lastActivity?: {
    timestamp: string;
    message: string;
    level: string;
  };
}