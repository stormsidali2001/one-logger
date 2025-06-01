// Core classes
export { Span } from './span.js';
export { Trace } from './trace.js';
export { TraceManager, traceManager } from './trace-manager.js';

// Main API
export { wrappedSpan, createSpan, getCurrentSpan, getCurrentTrace } from './wrapped-span.js';
export {wrappedObject} from './wrapped-span-object.js';

// Transports
export * from './transports/index.js';

// Types (re-exported from shared types package via main types module)
// SpanStatus, SpanMetadata, TraceTransport, TracingOptions, SpanData, TraceData
// are now available through the main types export

// Initialization function
import type { TracingOptions } from '@notjustcoders/one-logger-types';
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