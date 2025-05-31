# `logs-collector` Package Documentation

## 1. Overview

`logs-collector` is a modular TypeScript logger for Node.js and browser environments. It provides capabilities for both standard logging and distributed tracing. This package is designed to be used with the [Log Hunter Electron app](https://github.com/stormsidali2001/log-hunter).

## 2. Installation

To install the package, use pnpm:

```sh
pnpm add logs-collector
```

## 3. Initialization

The recommended way to initialize the `logs-collector` is by using the `initializeOneLogger` function, which sets up both logging and tracing capabilities.

### Unified Initialization (`initializeOneLogger`)

Call this function once at your application's startup.

```typescript
import { initializeOneLogger } from 'logs-collector';

async function startApp() {
  await initializeOneLogger({
    name: 'your-project-name', // Project name
    description: 'A description of your project', // Optional project description
    isDev: true, // Set to true for development, false for production
    // failOnDuplicateName: false, // Optional: if true, errors on duplicate project name

    // Optional tracer configuration
    tracer: {
      batchSize: 10, // Number of traces to batch before sending (default: 10)
      flushInterval: 5000, // Interval in ms to flush traces (default: 5000ms)
      // useHttpTransport: true, // Defaults to isDev. If true, uses HTTP transport, else console.
    }
  });

  // Your application logic here
}

startApp();
```

**`OneLoggerInitOptions`**:

*   `name: string`: Project name to use if creating a new project.
*   `description?: string`: Optional project description.
*   `failOnDuplicateName?: boolean`: If `true`, throws an error if the project name already exists. Defaults to `false` (reuses existing project).
*   `isDev?: boolean`: If `true` (default), attempts to connect to the One Logger app. If `false`, uses console transport. Set to `false` in production.
*   `tracer?: object`: Optional configuration for tracing.
    *   `batchSize?: number`: Number of traces to collect before sending (default: 10).
    *   `flushInterval?: number`: Interval in milliseconds to send batched traces (default: 5000).
    *   `useHttpTransport?: boolean`: If `true`, uses HTTP transport for traces. If `false`, uses console transport. Defaults to the value of `isDev`.

### Logger-Only Initialization (`initializeLogger`)

If you only need logging functionality:

```typescript
import { initializeLogger } from 'logs-collector';

async function startApp() {
  await initializeLogger({
    name: 'your-project-name',
    description: 'A description of your project',
    isDev: true
  });
}

startApp();
```

### Tracing-Only or Custom Tracing Initialization (`initializeTracing`)

If you need to initialize tracing separately or with more custom configurations (e.g., custom transport):

```typescript
import { initializeTracing, ConsoleTraceTransport, HttpTraceTransport } from 'logs-collector';
// Assuming logger is already initialized and logger.projectId is available for HttpTraceTransport
import { logger } from 'logs-collector'; 

// Example: Using ConsoleTransport
initializeTracing({
  transport: new ConsoleTraceTransport('[TRACING]'), // Or new HttpTraceTransport(logger.projectId)
  batchSize: 5,
  flushInterval: 3000
});
```

## 4. Logging Usage

Once initialized, you can import and use the singleton `logger` instance anywhere in your application.

```typescript
import { logger } from 'logs-collector';

// After initializeOneLogger() or initializeLogger() has been called

logger.info('This is an informational message.');
logger.warn('This is a warning message.', { customData: 'some value' });
logger.error('This is an error message.', { errorDetails: { code: 500 } });
logger.log('This is a generic log message.');
```

Available log methods:
*   `logger.log(message: string, meta?: Record<string, unknown>)`
*   `logger.info(message: string, meta?: Record<string, unknown>)`
*   `logger.warn(message: string, meta?: Record<string, unknown>)`
*   `logger.error(message: string, meta?: Record<string, unknown>)`

## 5. Tracing Usage

Tracing allows you to monitor the performance and flow of operations within your application.

### Wrapping Functions (`wrappedSpan`)

The easiest way to add tracing is by wrapping your functions with `wrappedSpan`. This automatically creates a span when the function is called and finishes it when the function completes or throws an error.

```typescript
import { wrappedSpan } from 'logs-collector';

// Example with static metadata
const fetchData = wrappedSpan(
  'fetchDataSpan', // Span name
  async (url: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    return { data: 'some data from ' + url };
  },
  { layer: 'data-access', operation: 'fetch' } // Static metadata
);

// Example with dynamic metadata
const processItem = wrappedSpan(
  'processItemSpan',
  (itemId: string, data: any) => {
    // Simulate processing
    return `Processed ${itemId} with ${JSON.stringify(data)}`;
  },
  (itemId, data) => ({ itemId, inputDataSize: JSON.stringify(data).length }) // Dynamic metadata function
);

async function handleRequest(id: string) {
  const data = await fetchData(`/items/${id}`);
  const result = processItem(id, data);
  console.log(result);
}

handleRequest('item-123');
```

### Manual Span Creation (`createSpan`)

For more complex scenarios where `wrappedSpan` is not suitable, you can manually create and manage spans using `createSpan`.

```typescript
import { createSpan } from 'logs-collector';

async function complexOperation() {
  const { span, finish, addMetadata } = createSpan('complexOperationSpan', { initialInfo: 'starting' });

  try {
    // Part 1
    await new Promise(resolve => setTimeout(resolve, 50));
    addMetadata('part1_status', 'completed');

    // Part 2
    if (Math.random() > 0.5) {
      throw new Error('Random failure in Part 2');
    }
    await new Promise(resolve => setTimeout(resolve, 70));
    addMetadata('part2_status', 'completed');

    finish('completed'); // Mark span as completed successfully
  } catch (error) {
    finish('failed', error instanceof Error ? error : new Error(String(error))); // Mark span as failed
    throw error;
  }
}
```

### Flushing Traces (`flushTraces`)

Traces are typically batched and sent periodically. You can force an immediate flush of all pending traces using `flushTraces`. This is useful before an application exits.

```typescript
import { flushTraces } from 'logs-collector';

async function shutdownApp() {
  // ... other shutdown logic ...
  await flushTraces();
  console.log('All traces flushed. Exiting.');
}
```

### Trace Transports

*   **`ConsoleTraceTransport`**: Prints traces to the console. Useful for development or when an HTTP endpoint is not available.
*   **`HttpTraceTransport`**: Sends traces to the One Logger backend via HTTP. Requires `logger.projectId` to be available (set during `initializeLogger` or `initializeOneLogger`).

## 6. Key Exports

### General
*   `initializeOneLogger`: Unified initialization for logger and tracer.
*   `logger`: Singleton logger instance.
*   `initializeLogger`: Logger-specific initialization.
*   `LoggerInitOptions`: Type for logger initialization options.

### Tracing
*   `initializeTracing`: Tracing-specific initialization.
*   `wrappedSpan`: Wraps a function to automatically create spans.
*   `createSpan`: Manually creates a span.
*   `getCurrentSpan`: Gets the current active span.
*   `getCurrentTrace`: Gets the current active trace.
*   `flushTraces`: Flushes all pending traces.
*   `ConsoleTraceTransport`: Transport that logs traces to the console.
*   `HttpTraceTransport`: Transport that sends traces via HTTP.
*   `Span`: Class representing a span.
*   `Trace`: Class representing a trace.
*   `TracingOptions`: Type for tracing initialization options.

This documentation provides a guide to using the `logs-collector` package. For more detailed examples, refer to the source code, particularly test files like `src/tracing/test-example.ts`.