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

    try {
      // Execute the function
      const result = fn(...args);

      // Handle async functions
      if (isPromiseLike(result)) {
        return result.then(
          (value) => {
            span.finish('completed');
            traceManager.finishSpan(span);
            return value;
          },
          (error) => {
            span.finish('failed', error);
            traceManager.finishSpan(span);
            throw error;
          }
        ) as TReturn;
      }

      // Handle sync functions
      span.finish('completed');
      traceManager.finishSpan(span);
      return result;
    } catch (error) {
      // Handle sync errors
      span.finish('failed', error instanceof Error ? error : new Error(String(error)));
      traceManager.finishSpan(span);
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

/**
 * Wrap an object with tracing capabilities for all its methods
 * @param name - Base name for the object (will be prefixed to method names)
 * @param obj - Object to wrap
 * @param metadata - Static metadata object or dynamic metadata function for all methods
 * @returns New object with all methods wrapped with tracing
 */
export function wrappedObject<T extends Record<string, any>>(
  name: string,
  obj: T,
  metadata?: SpanMetadata | ((methodName: string, ...args: any[]) => SpanMetadata)
): T {
  const wrappedObj = {} as Record<string, any>;

  // Copy all properties from the original object
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      
      // If the property is a function, wrap it with tracing
      if (typeof value === 'function') {
        const methodName = `${name}.${key}`;
        
        wrappedObj[key] = wrappedSpan(
          methodName,
          value.bind(obj), // Bind to original object to preserve 'this' context
          typeof metadata === 'function'
            ? (...args: any[]) => metadata(key, ...args)
            : metadata
        );
      } else {
        // Copy non-function properties as-is
        wrappedObj[key] = value;
      }
    }
  }

  // Copy prototype methods if they exist
  const prototype = Object.getPrototypeOf(obj);
  if (prototype && prototype !== Object.prototype) {
    const propertyNames = Object.getOwnPropertyNames(prototype);
    
    for (const key of propertyNames) {
      if (key !== 'constructor' && typeof obj[key] === 'function') {
        const methodName = `${name}.${key}`;
        
        wrappedObj[key] = wrappedSpan(
          methodName,
          obj[key].bind(obj), // Bind to original object to preserve 'this' context
          typeof metadata === 'function'
            ? (...args: any[]) => metadata(key, ...args)
            : metadata
        );
      }
    }
  }

  return wrappedObj as T;
}