import type { SpanMetadata } from '@notjustcoders/one-logger-types';
import { wrappedSpan } from './wrapped-span.js';

/**
 * Wrap a class with tracing capabilities for its constructor and methods
 * @param name - Base name for the class (will be prefixed to method names and constructor)
 * @param OriginalClass - The class to wrap
 * @param metadata - Static metadata object or dynamic metadata function for all methods and constructor
 * @returns New class with constructor and all methods wrapped with tracing
 */
export function wrappedClass<T extends new (...args: any[]) => any>(
  name: string,
  OriginalClass: T,
  metadata?: SpanMetadata | ((methodName: string, ...args: any[]) => SpanMetadata)
): T {
  const WrappedClass = class extends OriginalClass {
    constructor(...args: any[]) {
      const constructorName = `${name}.constructor`;
      const resolvedMetadata = typeof metadata === 'function'
        ? metadata('constructor', ...args)
        : metadata;

      const span = wrappedSpan(constructorName, () => {}, resolvedMetadata);
      // @ts-expect-error TS doesn't know about the span we are creating
      const finish = span(...args);

      try {
        super(...args);
        // @ts-expect-error TS doesn't know about the span we are creating
        if (typeof finish === 'function') finish(); // finish if sync
        // @ts-expect-error TS doesn't know about the span we are creating
        else if (finish && typeof finish.then === 'function') finish.then(() => {}, () => {}); // handle async constructor if it returns promise
      } catch (error) {
        // @ts-expect-error TS doesn't know about the span we are creating
        if (typeof finish === 'function') finish(error); // finish with error if sync
        // @ts-expect-error TS doesn't know about the span we are creating
        else if (finish && typeof finish.then === 'function') finish.then(() => { throw error; }, (e: any) => { throw e; }); // handle async constructor error
        throw error;
      }
    }
  } as T;

  // Wrap all methods from the original class prototype
  const prototype = OriginalClass.prototype;
  Object.getOwnPropertyNames(prototype).forEach(methodName => {
    if (methodName === 'constructor') return;

    const originalMethod = prototype[methodName];
    if (typeof originalMethod === 'function') {
      const fullMethodName = `${name}.${methodName}`;
      (WrappedClass.prototype as any)[methodName] = function (...args: any[]) {
        const methodMetadata = typeof metadata === 'function'
          ? metadata(methodName, ...args)
          : metadata;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this; // Capture 'this' context
        return wrappedSpan(
          fullMethodName,
          function (...innerArgs: any[]) { // Pass 'this' explicitly
            return originalMethod.apply(self, innerArgs);
          },
          methodMetadata
        )(...args);
      };
    }
  });

  // Wrap static methods
  Object.getOwnPropertyNames(OriginalClass).forEach(staticMethodName => {
    // @ts-expect-error - accessing static members
    const originalStaticMethod = OriginalClass[staticMethodName];
    if (typeof originalStaticMethod === 'function') {
      const fullStaticMethodName = `${name}.${staticMethodName}`;
      (WrappedClass as any)[staticMethodName] = wrappedSpan(
        fullStaticMethodName,
        originalStaticMethod,
        typeof metadata === 'function'
          ? (...args: any[]) => metadata(staticMethodName, ...args)
          : metadata
      );
    }
  });

  return WrappedClass;
}