// Core classes
export { Span } from './span.js';
export { Trace } from './trace.js';
export { TraceManager, traceManager } from './trace-manager.js';

// Main API
export { wrappedSpan, createSpan, getCurrentSpan, getCurrentTrace } from './wrapped-span.js';

// Transports
export * from './transports/index.js';

// Types
export type {
  SpanStatus,
  SpanMetadata,
  TraceTransport,
  TracingOptions,
  SpanData,
  TraceData
} from './types.js';

// Initialization function
import type { TracingOptions } from './types.js';
import { traceManager } from './trace-manager.js';

/**
 * Initialize tracing with the specified options
 * @param options - Tracing configuration options
 */
export function initializeTracing(options: TracingOptions): void {
  traceManager.initialize(options);
}

/**
 * Flush all pending traces immediately
 */
export async function flushTraces(): Promise<void> {
  await traceManager.flush();
}

/**
 * Get debug information about the current tracing state
 */
export function getTracingDebugInfo() {
  return traceManager.getDebugInfo();
}