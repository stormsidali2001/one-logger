# @notjustcoders/one-logger-client-sdk

A comprehensive logging and tracing client SDK with console and remote transports for Node.js and browser environments.

## Installation

```sh
pnpm add @notjustcoders/one-logger-client-sdk
```

## Quick Start

```ts
import { initializeOneLogger, logger, wrappedSpan } from '@notjustcoders/one-logger-client-sdk';

// Initialize the logger once at app startup
initializeOneLogger({
  name: 'your-app-name',
  description: 'Your application description',
  isDev: true, // Use console transport for development
  tracer: {
    batchSize: 1,
    flushInterval: 5000,
    useHttpTransport: false // Use console transport for dev
  }
});

// Use logger anywhere
logger.info('Hello from One Logger!', { userId: '123' });
logger.warn('Warning message', { context: 'validation' });
logger.error('Error occurred', { error: 'details' });
```

## Tracing with Spans

```ts
// Wrap functions for automatic tracing
const fetchUserData = wrappedSpan(
  'fetchUserData',
  async (userId: string) => {
    logger.info('Fetching user data', { userId });
    // Your async logic here
    const userData = await api.getUser(userId);
    return userData;
  },
  (userId) => ({ userId, operation: 'fetch' }) // metadata
);

// Nested spans are automatically tracked
const processUser = wrappedSpan(
  'processUser',
  async (userId: string) => {
    const userData = await fetchUserData(userId); // Creates nested span
    const processed = await validateUser(userData); // Another nested span
    return processed;
  },
  { layer: 'business-logic' }
);
```

## Configuration Options

```ts
initializeOneLogger({
  name: 'my-app',
  description: 'My application',
  isDev: false, // Set to false for production
  tracer: {
    batchSize: 10, // Number of spans to batch before sending
    flushInterval: 10000, // Flush interval in milliseconds
    useHttpTransport: true, // Use HTTP transport for production
  }
});
```

## Example Output

### Console Transport
When using console transport in development, you'll see formatted output like:

```
[DEMO] Trace abc123-def456-ghi789
↳ processUser ✓ (320ms) metadata: {"layer":"business-logic"}
  ↳ fetchUserData ✓ (201ms) metadata: {"userId":"123","operation":"fetch"}
  ↳ validateUser ✓ (101ms) metadata: {"layer":"validation"}
```

### HTTP Transport
(TODO: Add an example image here)

## Repository

- **GitHub**: [https://github.com/stormsidali2001/one-logger](https://github.com/stormsidali2001/one-logger)
- **Issues**: [https://github.com/stormsidali2001/one-logger/issues](https://github.com/stormsidali2001/one-logger/issues)

## License

MIT