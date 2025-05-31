// Project configuration interface
export interface ProjectConfig {
  trackedMetadataKeys?: string[]; // Metadata keys that should be stored in the logMetadata table
  [key: string]: any; // Allow for additional configuration options
}

// Core project interface
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string; // ISO date string
  config?: ProjectConfig;
}

// Project creation interface
export interface ProjectCreate {
  name: string;
  description?: string;
}

// Project update interface
export interface ProjectUpdate {
  name?: string;
  description?: string;
}

// Project metrics interface for analytics
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