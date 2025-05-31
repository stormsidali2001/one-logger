# @one-logger/types

Shared TypeScript types for the One Logger ecosystem.

## Overview

This package contains all the shared type definitions used across the One Logger packages, including:

- **CLI App** (`apps/cli-app`)
- **Logger SDK** (`packages/logger`)
- **Web Server** (`apps/vite-web-server`)

## Types Included

### Common Types
- `Status` - Common status enumeration
- `Metadata` - Generic metadata interface
- `Cursor` - Pagination cursor interface
- `PaginationOptions` - Common pagination options
- `MetadataFilter` - Metadata filtering interface

### Log Types
- `Log` - Core log interface
- `LogMetadata` - Log metadata structure
- `LogCreate` - Log creation interface
- `LogFilters` - Log filtering options
- `LogCursor` - Log-specific cursor

### Project Types
- `Project` - Core project interface
- `ProjectConfig` - Project configuration
- `ProjectCreate` - Project creation interface
- `ProjectUpdate` - Project update interface

### Trace Types
- `TraceData` - Core trace interface
- `SpanData` - Core span interface
- `CreateTraceData` - Trace creation interface
- `CreateSpanData` - Span creation interface
- `UpdateTraceData` - Trace update interface
- `UpdateSpanData` - Span update interface
- `TraceWithSpans` - Complete trace with spans
- `SpanStatus` - Span status type
- `SpanMetadata` - Span metadata interface

### Transport Types
- `Transport` - Base transport interface
- `LoggerTransport` - Logger transport interface
- `TraceTransport` - Trace transport interface
- `TracingOptions` - Tracing configuration
- `LoggerOptions` - Logger configuration

## Usage

```typescript
import type { 
  Log, 
  TraceData, 
  SpanData, 
  Project 
} from '@one-logger/types';

// Use the types in your code
const log: Log = {
  id: '123',
  projectId: 'project-1',
  level: 'info',
  message: 'Hello world',
  timestamp: new Date().toISOString(),
  metadata: []
};
```

## Building

```bash
pnpm build
```

## Development

```bash
pnpm dev
```