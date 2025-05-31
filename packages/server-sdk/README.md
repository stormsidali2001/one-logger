# @one-logger/server-sdk

A TypeScript SDK for interacting with the One Logger server API endpoints. This package provides a unified interface to access all server functionality including projects, logs, traces, configuration, and server management.

## Installation

```bash
npm install @one-logger/server-sdk
# or
yarn add @one-logger/server-sdk
# or
pnpm add @one-logger/server-sdk
```

## Quick Start

```typescript
import { OneLoggerSDK } from '@one-logger/server-sdk';

// Initialize the SDK
const oneLoggerSdk = new OneLoggerSDK({
  baseUrl: 'http://localhost:3000',
  apiKey: 'your-api-key', // optional
  timeout: 30000 // optional, defaults to 30 seconds
});

// Use the SDK
const projects = await oneLoggerSdk.projects.getAll();
console.log('Projects:', projects);
```

## API Reference

The SDK is organized into modules that correspond to different API endpoints:

### Projects (`oneLoggerSdk.projects`)

```typescript
// Get all projects
const projects = await oneLoggerSdk.projects.getAll();

// Get project by ID
const project = await oneLoggerSdk.projects.getById('project-id');

// Check if project exists
const exists = await oneLoggerSdk.projects.exists('project-name');

// Create a new project
const newProject = await oneLoggerSdk.projects.create({
  name: 'My Project',
  description: 'Project description'
});

// Update a project
const updatedProject = await oneLoggerSdk.projects.update('project-id', {
  name: 'Updated Name'
});

// Delete a project
await oneLoggerSdk.projects.delete('project-id');

// Get project metrics
const metrics = await oneLoggerSdk.projects.getMetrics('project-id');

// Get logs for a project
const logs = await oneLoggerSdk.projects.getLogs('project-id', {
  limit: 100,
  sortDirection: 'desc',
  level: 'error'
});

// Get historical log counts
const counts = await oneLoggerSdk.projects.getHistoricalLogCounts('project-id', {
  days: 7
});

// Get metadata keys
const metadataKeys = await oneLoggerSdk.projects.getMetadataKeys('project-id');

// Get/update project configuration
const config = await oneLoggerSdk.projects.getConfig('project-id');
await oneLoggerSdk.projects.updateConfig('project-id', {
  trackedMetadataKeys: ['key1', 'key2']
});

// Clear project logs
await oneLoggerSdk.projects.clearLogs('project-id');

// Get project traces
const traces = await oneLoggerSdk.projects.getTraces('project-id');

// Clear project traces
await oneLoggerSdk.projects.clearTraces('project-id');
```

### Logs (`oneLoggerSdk.logs`)

```typescript
// Create a new log
const log = await oneLoggerSdk.logs.create({
  projectId: 'project-id',
  level: 'info',
  message: 'Log message',
  timestamp: new Date().toISOString(),
  metadata: [
    { key: 'userId', value: '123' },
    { key: 'action', value: 'login' }
  ]
});

// Get all logs with pagination
const logs = await oneLoggerSdk.logs.getAll({
  limit: '50',
  sortDirection: 'desc'
});

// Get log by ID
const log = await oneLoggerSdk.logs.getById('log-id');
```

### Traces (`oneLoggerSdk.traces`)

```typescript
// Create a new trace
const trace = await oneLoggerSdk.traces.create({
  projectId: 'project-id',
  name: 'API Request',
  startTime: new Date().toISOString(),
  metadata: { endpoint: '/api/users' }
});

// Get trace by ID
const trace = await oneLoggerSdk.traces.getById('trace-id');

// Update a trace
const updatedTrace = await oneLoggerSdk.traces.update('trace-id', {
  endTime: new Date().toISOString(),
  status: 'completed'
});

// Get complete trace with spans
const completeTrace = await oneLoggerSdk.traces.getComplete('trace-id');

// Get traces by project
const traces = await oneLoggerSdk.traces.getByProjectId('project-id', {
  limit: 50,
  sortDirection: 'desc'
});

// Create a span
const span = await oneLoggerSdk.traces.createSpan({
  traceId: 'trace-id',
  name: 'Database Query',
  startTime: new Date().toISOString(),
  parentSpanId: 'parent-span-id'
});

// Get span by ID
const span = await oneLoggerSdk.traces.getSpanById('span-id');

// Update a span
const updatedSpan = await oneLoggerSdk.traces.updateSpan('span-id', {
  endTime: new Date().toISOString(),
  status: 'completed'
});

// Get spans by trace ID
const spans = await oneLoggerSdk.traces.getSpansByTraceId('trace-id');
```

### Configuration (`oneLoggerSdk.config`)

```typescript
// Get all configuration
const allConfig = await oneLoggerSdk.config.getAll();

// Get specific configuration value
const value = await oneLoggerSdk.config.get('config-key');

// Set configuration value
await oneLoggerSdk.config.set('config-key', 'config-value');
```

### Server Management (`oneLoggerSdk.server`)

```typescript
// Get server logs
const logs = await oneLoggerSdk.server.getLogs({ type: 'all' });

// Get MCP server logs
const mcpLogs = await oneLoggerSdk.server.getMCPLogs({ type: 'stderr' });

// Restart server
await oneLoggerSdk.server.restart();

// Restart MCP server
await oneLoggerSdk.server.restartMCP();

// Clear server logs
await oneLoggerSdk.server.clearLogs({ type: 'all' });

// Clear MCP server logs
await oneLoggerSdk.server.clearMCPLogs({ type: 'all' });
```

## Configuration

The SDK accepts the following configuration options:

```typescript
interface SDKConfig {
  baseUrl: string;        // Base URL of the One Logger server
  apiKey?: string;        // Optional API key for authentication
  timeout?: number;       // Request timeout in milliseconds (default: 30000)
}
```

## Error Handling

The SDK throws errors for HTTP failures. You should wrap your calls in try-catch blocks:

```typescript
try {
  const projects = await oneLoggerSdk.projects.getAll();
  console.log(projects);
} catch (error) {
  console.error('Failed to fetch projects:', error.message);
}
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions. All API responses are properly typed using the shared types from `@one-logger/types`.

## License

MIT