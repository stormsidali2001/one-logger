// Re-export trace types from shared types package
export type {
  TraceData,
  SpanData,
  CreateTraceData,
  CreateSpanData,
  UpdateTraceData,
  UpdateSpanData,
  TraceWithSpans,
  SpanStatus,
  SpanMetadata,
  TraceQueryOptions,
  SpanQueryOptions
} from '@notjustcoders/types';

// CLI-specific types can be added here if needed