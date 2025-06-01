import type { SpanMetadata } from '@notjustcoders/one-logger-types';
import { wrappedSpan } from './wrapped-span';

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
