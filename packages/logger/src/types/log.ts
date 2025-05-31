export type {
  Log,
  LogCreate,
  LogMetadata,
  LogFilters
} from '@one-logger/types';

// Re-export LogLevel for backward compatibility
export type LogLevel = 'log' | 'info' | 'warn' | 'error';