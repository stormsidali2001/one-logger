import { traceManager } from './trace-manager.js';
import type { SpanMetadata } from '@notjustcoders/one-logger-types';

/**
 * Check if a value is a Promise-like object
 */
function isPromiseLike(value: any): value is Promise<any> {
  return value && typeof value === 'object' && typeof value.then === 'function';
}

/**
 * Wrap a function with tracing capabilities
 * @param name - Human-readable name for the span
 * @param fn - Function to wrap
 * @param metadata - Static metadata object or dynamic metadata function
 * @returns Wrapped function that creates spans when called
 */
export function wrappedSpan<TArgs extends any[], TReturn>(
  name: string,
  fn: (...args: TArgs) => TReturn,
  metadata?: SpanMetadata | ((...args: TArgs) => SpanMetadata)
): (...args: TArgs) => TReturn {
  return (...args: TArgs): TReturn => {
    // Resolve metadata (static or dynamic)
    const resolvedMetadata = typeof metadata === 'function' 
      ? metadata(...args)
      : metadata || {};

    // Start the span
    const span = traceManager.startSpan(name, resolvedMetadata);
    
    // Store the current span stack length to ensure proper cleanup
    const initialStackLength = traceManager['spanStack']?.length || 0;

    const finishSpanSafely = (status: 'completed' | 'failed', error?: Error) => {
      try {
        if (!span.isFinished()) {
          span.finish(status, error);
        }
        traceManager.finishSpan(span);
      } catch (finishError) {
        console.warn('Error finishing span:', finishError);
      }
    };

    try {
      // Execute the function
      const result = fn(...args);

      // Handle async functions
      if (isPromiseLike(result)) {
        return result.then(
          (value) => {
            finishSpanSafely('completed');
            return value;
          },
          (error) => {
            finishSpanSafely('failed', error instanceof Error ? error : new Error(String(error)));
            throw error;
          }
        ) as TReturn;
      }

      // Handle sync functions
      finishSpanSafely('completed');
      return result;
    } catch (error) {
      // Handle sync errors
      finishSpanSafely('failed', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };
}

/**
 * Create a span manually for more complex scenarios
 * @param name - Human-readable name for the span
 * @param metadata - Optional metadata for the span
 * @returns Object with span and finish function
 */
export function createSpan(name: string, metadata?: SpanMetadata) {
  const span = traceManager.startSpan(name, metadata);
  
  return {
    span,
    finish: (status: 'completed' | 'failed' = 'completed', error?: Error) => {
      span.finish(status, error);
      traceManager.finishSpan(span);
    },
    addMetadata: (key: string, value: any) => {
      span.addMetadata(key, value);
    }
  };
}

/**
 * Get the current active span (useful for adding metadata)
 */
export function getCurrentSpan() {
  return traceManager.getCurrentSpan();
}

/**
 * Get the current active trace
 */
export function getCurrentTrace() {
  return traceManager.getCurrentTrace();
}

