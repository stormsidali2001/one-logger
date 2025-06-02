# Context Adapter System

The Context Adapter system provides a unified interface for handling asynchronous context propagation in both browser and Node.js environments, solving the inherent issues with tracing across async boundaries.

## Problem Statement

The original tracing system used a simple stack-based approach that worked well for synchronous operations but had limitations with asynchronous operations:

1. **Lost Context**: When async operations (Promises, setTimeout, etc.) were used, the span context would be lost
2. **Parallel Operations**: Multiple concurrent async operations would interfere with each other
3. **Environment Differences**: Node.js and browser environments handle async context differently

## Solution: Context Adapter Pattern

The Context Adapter pattern provides different implementations for different environments:

### Node.js Implementation
- Uses `AsyncLocalStorage` from Node.js `async_hooks` module
- Automatically propagates context across async boundaries
- Supports parallel async operations without interference
- Zero configuration required

### Browser Implementation
- Falls back to stack-based approach
- Works for synchronous operations and manual context management
- Lightweight with no additional dependencies

## Usage

### Automatic Context Propagation

The system automatically detects the environment and uses the appropriate adapter:

```typescript
import { wrappedSpan } from '@notjustcoders/one-logger';

// This will automatically use the right context adapter
const tracedFunction = wrappedSpan('myFunction', async () => {
  // In Node.js: context is automatically preserved
  await someAsyncOperation();
  
  // The current span is still available here
  const currentSpan = getCurrentSpan();
  return 'result';
});
```

### Manual Context Management

For more complex scenarios, you can manually manage context:

```typescript
import { createSpan } from '@notjustcoders/one-logger';

const { span, runWithContext, finish } = createSpan('complexOperation');

// Run code within the span context
const result = runWithContext(() => {
  // This code runs within the span context
  return performOperation();
});

finish('completed');
```

### Environment Detection

You can check if automatic async context is supported:

```typescript
import { getContextAdapter } from '@notjustcoders/one-logger';

const adapter = getContextAdapter();
if (adapter.supportsAsyncContext()) {
  console.log('Automatic async context propagation is available');
} else {
  console.log('Using fallback stack-based context');
}
```

## Architecture

### ContextAdapter Interface

```typescript
interface ContextAdapter {
  initialize(): void;
  runWithSpan<T>(span: Span, fn: () => T): T;
  getCurrentSpan(): Span | undefined;
  setCurrentSpan(span: Span): void;
  clearCurrentSpan(): void;
  supportsAsyncContext(): boolean;
}
```

### Implementation Classes

1. **NodeContextAdapter**: Uses `AsyncLocalStorage` for automatic async context
2. **BrowserContextAdapter**: Uses stack-based approach as fallback

### Factory Function

The `createContextAdapter()` function automatically detects the environment and returns the appropriate implementation.

## Benefits

### For Node.js Applications
- **Automatic Context Propagation**: No manual context management needed
- **Parallel Operations**: Multiple async operations don't interfere
- **Framework Agnostic**: Works with any async patterns (Promises, async/await, callbacks)
- **Zero Configuration**: Works out of the box

### For Browser Applications
- **Lightweight**: No additional dependencies
- **Backward Compatible**: Existing code continues to work
- **Manual Control**: Can manually manage context when needed

### For Library Authors
- **Unified API**: Same interface works in both environments
- **Transparent**: Existing wrapped functions automatically benefit
- **Extensible**: Can provide custom adapters for specific needs

## Examples

### Node.js Async Context Propagation

```typescript
// This works automatically in Node.js
const tracedAsyncFunction = wrappedSpan('asyncOp', async () => {
  console.log('Current span:', getCurrentSpan()?.name); // 'asyncOp'
  
  await Promise.all([
    someAsyncTask1(),
    someAsyncTask2(),
    someAsyncTask3()
  ]);
  
  console.log('Current span:', getCurrentSpan()?.name); // Still 'asyncOp'
  return 'completed';
});
```

### Browser Manual Context Management

```typescript
// In browser, you might need manual context for complex scenarios
const { span, runWithContext, finish } = createSpan('browserOperation');

runWithContext(() => {
  // Synchronous operations automatically have context
  performSyncOperation();
  
  // For async operations, you might need to manually propagate
  setTimeout(() => {
    runWithContext(() => {
      // Context is available here
      console.log('Current span:', getCurrentSpan()?.name);
    });
  }, 100);
});

finish('completed');
```

### Testing Different Environments

```typescript
import { setContextAdapter } from '@notjustcoders/one-logger';

// You can set a custom adapter for testing
const mockAdapter = {
  // ... implement ContextAdapter interface
};

setContextAdapter(mockAdapter);
```

## Migration Guide

Existing code using the tracing system will continue to work without changes. The new context adapter system is backward compatible and provides enhanced functionality automatically.

### Before (Stack-based only)
```typescript
const tracedFn = wrappedSpan('myFn', async () => {
  // Context might be lost in async operations
  await someAsyncOp();
  return getCurrentSpan(); // Might be undefined
});
```

### After (Context Adapter)
```typescript
const tracedFn = wrappedSpan('myFn', async () => {
  // Context is preserved automatically in Node.js
  await someAsyncOp();
  return getCurrentSpan(); // Available in Node.js
});
```

## Performance Considerations

- **Node.js**: Minimal overhead from `AsyncLocalStorage`
- **Browser**: Same performance as before (stack-based)
- **Memory**: Context is automatically cleaned up when async operations complete
- **CPU**: Negligible impact on application performance

## Limitations

### Browser Environment
- No automatic async context propagation
- Manual context management required for complex async scenarios
- Stack-based approach has the same limitations as before

### Node.js Environment
- Requires Node.js 12.17.0+ for `AsyncLocalStorage`
- Some edge cases with native async operations might need manual handling

## Future Enhancements

1. **Zone.js Integration**: Optional Zone.js adapter for browser environments
2. **Custom Adapters**: Support for framework-specific context adapters
3. **Performance Monitoring**: Built-in metrics for context propagation efficiency
4. **Debug Mode**: Enhanced debugging tools for context flow visualization