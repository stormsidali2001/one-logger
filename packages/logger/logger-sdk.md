# Logger SDK - Tracing Architecture Plan

## Overview

This document outlines the architecture for adding distributed tracing capabilities to the existing logger package. The goal is to provide a simple, intuitive API for wrapping functions with spans while maintaining the existing logging functionality.

## Target API

```typescript
const getUserUseCase = wrappedSpan(
  'getUserUseCase',
  (id) => userRepository.fetch(id),
  { layer: 'useCase', feature: 'user' }
);

const useUser = wrappedSpan(
  'useUser',
  (id) => {
    return getUserUseCase(id);
  },
  (id) => ({ userId: id, source: 'useUser hook' }) // dynamic metadata
);
```

### Expected Output
```
↳ useUser ✓ (1.2ms) metadata: { userId: "123", source: "useUser hook" }
  ↳ getUserUseCase ✓ (1.1ms) metadata: { layer: "useCase", feature: "user" }
```

## Architecture Components

### 1. TraceManager (Singleton)

**Purpose**: Central manager for all tracing operations in the application.

**Responsibilities**:
- Maintain the current span stack (context management)
- Generate unique span and trace IDs
- Track active spans and their relationships
- Submit completed traces to the transport layer
- Manage trace batching and submission timing

**Key Methods**:
- `startSpan(name: string, metadata?: SpanMetadata): Span`
- `finishSpan(span: Span): void`
- `getCurrentSpan(): Span | null`
- `submitTrace(trace: Trace): void`
- `flush(): Promise<void>` - Force submit all pending traces

### 2. TraceTransport Interface

**Purpose**: Abstract interface for submitting traces to different backends.

```typescript
interface TraceTransport {
  sendTraces(traces: Trace[]): Promise<void>;
}
```

**Implementations**:
- `HttpTraceTransport` - Sends traces to HTTP backend
- `ConsoleTraceTransport` - Outputs traces to console for development

### 3. Span Class

**Purpose**: Represents a single unit of work with timing and metadata.

**Properties**:
- `id: string` - Unique span identifier
- `traceId: string` - Parent trace identifier
- `parentSpanId?: string` - Parent span identifier (null for root spans)
- `name: string` - Human-readable span name
- `startTime: number` - Start timestamp
- `endTime?: number` - End timestamp
- `duration?: number` - Calculated duration in milliseconds
- `metadata: Record<string, any>` - Span metadata/tags
- `status: 'success' | 'error'` - Span completion status
- `error?: Error` - Error information if span failed

**Key Methods**:
- `finish(status?: 'success' | 'error', error?: Error): void`
- `addMetadata(key: string, value: any): void`
- `setStatus(status: 'success' | 'error', error?: Error): void`

### 4. Trace Class

**Purpose**: Represents a complete trace containing multiple spans.

**Properties**:
- `id: string` - Unique trace identifier
- `spans: Span[]` - All spans in this trace
- `startTime: number` - Trace start time
- `endTime?: number` - Trace end time
- `duration?: number` - Total trace duration

### 5. wrappedSpan Function

**Purpose**: Main API for wrapping functions with tracing.

```typescript
function wrappedSpan<TArgs extends any[], TReturn>(
  name: string,
  fn: (...args: TArgs) => TReturn,
  metadata?: SpanMetadata | ((...args: TArgs) => SpanMetadata)
): (...args: TArgs) => TReturn
```

**Behavior**:
- Creates a new span when the wrapped function is called
- Handles both sync and async functions
- Supports static metadata objects or dynamic metadata functions
- Automatically captures errors and sets span status
- Maintains parent-child relationships through span stack

### 6. Logger Class (Unchanged)

**Purpose**: Maintains existing logging functionality without modification.

The current Logger class will remain unchanged to ensure backward compatibility. Tracing will be a separate concern that can optionally integrate with logging.

## Implementation Plan

### Phase 1: Core Infrastructure
1. Create `Span` class with timing and metadata capabilities
2. Create `Trace` class for grouping spans
3. Implement `TraceManager` singleton with span stack management
4. Create `TraceTransport` interface

### Phase 2: Transport Implementations
1. Implement `ConsoleTraceTransport` for development
2. Implement `HttpTraceTransport` for production
3. Add batching and retry logic

### Phase 3: wrappedSpan API
1. Implement the main `wrappedSpan` function
2. Add support for both sync and async functions
3. Implement dynamic metadata support
4. Add error handling and status tracking

### Phase 4: Integration & Testing
1. Add initialization function for trace transport configuration
2. Create comprehensive test suite
3. Add performance benchmarks
4. Update documentation and examples

## File Structure

```
src/
├── tracing/
│   ├── index.ts              # Main exports
│   ├── trace-manager.ts      # TraceManager singleton
│   ├── span.ts               # Span class
│   ├── trace.ts              # Trace class
│   ├── wrapped-span.ts       # wrappedSpan function
│   ├── transports/
│   │   ├── index.ts          # Transport exports
│   │   ├── trace-transport.ts # Interface definition
│   │   ├── console.ts        # Console transport
│   │   └── http.ts           # HTTP transport
│   └── types.ts              # Type definitions
├── logger.ts                 # Existing logger (unchanged)
└── index.ts                  # Updated main exports
```

## Configuration

```typescript
// Initialize tracing alongside existing logger
import { initializeLogger } from 'logs-collector';
import { initializeTracing } from 'logs-collector/tracing';

// Existing logger initialization
await initializeLogger({
  name: 'my-app',
  description: 'My application'
});

// New tracing initialization
initializeTracing({
  transport: new HttpTraceTransport('http://localhost:5173/api/traces'),
  batchSize: 10,
  flushInterval: 5000 // 5 seconds
});
```

## Benefits

1. **Simple API**: Single function wrapper for adding tracing
2. **Automatic Context**: Parent-child relationships handled automatically
3. **Flexible Metadata**: Support for both static and dynamic metadata
4. **Error Handling**: Automatic error capture and span status management
5. **Performance**: Minimal overhead when tracing is disabled
6. **Backward Compatible**: Existing logger functionality unchanged
7. **Transport Agnostic**: Easy to switch between console and HTTP outputs
