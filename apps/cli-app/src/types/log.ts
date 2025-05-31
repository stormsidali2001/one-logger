// Re-export log types from shared types package
export type {
  Log,
  LogMetadata,
  LogCursor,
  LogFilters,
  LogPaginationParams,
  MetadataFilter
} from '@one-logger/types';

// Re-export project types from shared types package
export type {
  Project,
  ProjectConfig,
  ProjectMetrics
} from '@one-logger/types';

// CLI-specific types can be added here if needed