# @notjustcoders/one-logger-client-sdk

A comprehensive logging and tracing client SDK with console and remote transports for Node.js and browser environments.

## Installation

```sh
pnpm add @notjustcoders/one-logger-client-sdk
```

## Quick Start

```ts
import { initializeOneLogger, logger, wrappedSpan, wrappedObject } from '@notjustcoders/one-logger-client-sdk';

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

## Tracing with Wrapped Objects

For classes or objects with multiple methods, use `wrappedObject` to automatically trace all method calls:

```ts
class UserService {
  private users: { id: string; name: string }[] = [];

  async createUser(name: string): Promise<{ id: string; name: string }> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const user = { id: Math.random().toString(36).substr(2, 9), name };
    this.users.push(user);
    logger.info('User created successfully', { userId: user.id, name });
    return user;
  }

  getUser(id: string): { id: string; name: string } | undefined {
    const user = this.users.find(user => user.id === id);
    logger.info('User lookup', { userId: id, found: !!user });
    return user;
  }

  getAllUsers(): { id: string; name: string }[] {
    logger.info('Retrieved all users', { count: this.users.length });
    return [...this.users];
  }
}

// Wrap the entire service - all methods will be automatically traced
const userService = new UserService();
const tracedUserService = wrappedObject(
  'UserService',
  userService,
  (methodName, ...args) => ({
    method: methodName,
    argsCount: args.length,
    layer: 'service'
  })
);

// All method calls are now automatically traced
const user = await tracedUserService.createUser('Alice');
const foundUser = tracedUserService.getUser(user.id);
const allUsers = tracedUserService.getAllUsers();
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

**Wrapped Spans:**
```
[DEMO] Trace abc123-def456-ghi789
↳ processUser ✓ (320ms) metadata: {"layer":"business-logic"}
  ↳ fetchUserData ✓ (201ms) metadata: {"userId":"123","operation":"fetch"}
  ↳ validateUser ✓ (101ms) metadata: {"layer":"validation"}
```

**Wrapped Objects:**
```
[DEMO] Trace def456-ghi789-jkl012
↳ UserService.createUser ✓ (120ms) metadata: {"method":"createUser","argsCount":1,"layer":"service"}
↳ UserService.getUser ✓ (5ms) metadata: {"method":"getUser","argsCount":1,"layer":"service"}
↳ UserService.getAllUsers ✓ (2ms) metadata: {"method":"getAllUsers","argsCount":0,"layer":"service"}
```

### HTTP Transport
(TODO: Add an example image here)

## Repository

- **GitHub**: [https://github.com/stormsidali2001/one-logger](https://github.com/stormsidali2001/one-logger)
- **Issues**: [https://github.com/stormsidali2001/one-logger/issues](https://github.com/stormsidali2001/one-logger/issues)

## License

MIT