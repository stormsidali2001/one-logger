// Main SDK export
export { OneLoggerSDK } from './sdk.js';
import { OneLoggerSDK } from './sdk.js';

// Client and configuration types
export type { SDKConfig } from './client.js';
export { HttpClient } from './client.js';

// Module exports
export { ProjectsModule } from './modules/projects.js';
export { LogsModule } from './modules/logs.js';
export { TracesModule } from './modules/traces.js';
export { ConfigModule } from './modules/config.js';
export { ServerModule } from './modules/server.js';

// Type exports from @notjustcoders/one-logger-types
export type {
  ProjectCreateData,
  ProjectUpdateData,
  ProjectConfig,
  ProjectMetrics,
  LogsOptions,
  TracesOptions,
  HistoricalCountsOptions,
  LogMetadata,
  LogCreateData,
  LogCursor,
  LogPaginationParams,
  TraceCreateData,
  TraceUpdateData,
  SpanCreateData,
  SpanUpdateData,
  TraceWithSpans,
  ConfigValue,
  SetConfigData,
  ServerLogsOptions,
  ServerLogs
} from '@notjustcoders/one-logger-types';

// Re-export types from @notjustcoders/one-logger-types for convenience
export type {
  Project,
  Log,
  TraceData,
  SpanData
} from '@notjustcoders/one-logger-types';

// Default export for convenience
export default OneLoggerSDK;