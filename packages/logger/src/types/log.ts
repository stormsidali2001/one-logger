export type {
  Log,
  LogCreate,
  LogMetadata,
  LogFilters
} from '@notjustcoders/types';

// Re-export LogLevel for backward compatibility
export type LogLevel = 'log' | 'info' | 'warn' | 'error';