# @notjustcoders/one-logger-client-sdk

A comprehensive logging and tracing client SDK with console and remote transports for Node.js and browser environments.

## Installation

```sh
pnpm add @notjustcoders/one-logger-client-sdk
```

## Quick Start

```ts
import { initializeOneLogger, logger, wrappedSpan, wrappedObject, wrappedClass } from '@notjustcoders/one-logger-client-sdk';

// Initialize the logger once at app startup
initializeOneLogger({
  name: 'your-app-name',
  description: 'Your application description',
  isDev: true, // Use console transport for development
  logger: {
    batchSize: 10, // Send logs in batches of 10
    flushInterval: 5000 // Flush logs every 5 seconds
  },
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

// Example with wrappedClass (see section below for more details)
class MyService {
  constructor() { logger.info('MyService created'); }
  doSomething() { logger.info('Doing something'); return 'done'; }
  static staticMethod() { logger.info('Static method called'); return 'static done'; }
}
const TracedService = wrappedClass('MyService', MyService);
const instance = new TracedService();
instance.doSomething();
TracedService.staticMethod();
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

## Tracing with Wrapped Classes

For entire classes, you can use `wrappedClass` to automatically trace the constructor and all methods (instance and static):

```ts
import { wrappedClass, logger } from '@notjustcoders/one-logger-client-sdk';

class GreeterService {
  private greeting: string;

  constructor(greeting: string) {
    this.greeting = greeting;
    logger.info('GreeterService initialized', { greeting });
  }

  greet(name: string): string {
    const message = `${this.greeting}, ${name}!`;
    logger.info('Greeting generated', { name, message });
    return message;
  }

  static staticGreet(name: string): string {
    const message = `Hello from static, ${name}!`;
    logger.info('Static greeting generated', { name, message });
    return message;
  }
}

// Wrap the entire class
const TracedGreeterService = wrappedClass(
  'GreeterService',
  GreeterService,
  (methodName, ...args) => ({
    method: methodName, // 'constructor', 'greet', or 'staticGreet'
    argsCount: args.length,
    type: methodName === 'constructor' || GreeterService.prototype.hasOwnProperty(methodName) ? 'instance' : 'static'
  })
);

// Constructor and all method calls are now automatically traced
const greeter = new TracedGreeterService('Hi'); // Constructor span
const message1 = greeter.greet('Alice'); // Instance method span
const message2 = TracedGreeterService.staticGreet('Bob'); // Static method span
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
import { initializeOneLogger, createContextAdapter } from '@notjustcoders/one-logger-client-sdk';

initializeOneLogger({
  name: 'my-app',
  description: 'My application',
  isDev: false, // Set to false for production
  logger: {
    batchSize: 10, // Number of logs to batch before sending (default: 10)
    flushInterval: 5000, // Flush interval in milliseconds (default: 5000)
  },
  tracer: {
    batchSize: 10, // Number of spans to batch before sending
    flushInterval: 10000, // Flush interval in milliseconds
    useHttpTransport: true, // Use HTTP transport for production
    contextAdapter: createContextAdapter(), // Enable async context propagation
  }
});
```

### Logger Batch Configuration

The logger now supports batching to improve performance by sending multiple logs in a single request:

- **`batchSize`**: Number of logs to collect before sending a batch (default: 10)
- **`flushInterval`**: Maximum time in milliseconds to wait before flushing pending logs (default: 5000)

Logs are automatically sent when either the batch size is reached or the flush interval expires. You can also manually flush pending logs:

```ts
import { logger } from '@notjustcoders/one-logger-client-sdk';

// Manually flush any pending logs
await logger.flush();

// Configure batch settings at runtime
logger.setBatchConfig(20, 10000); // 20 logs per batch, 10 second flush interval
```

## Context Adapters for Async Context Propagation

Context adapters enable proper span context propagation across asynchronous operations in Node.js environments. This ensures that nested spans maintain their parent-child relationships even when crossing async boundaries.

### Automatic Context Adapter

```ts
import { initializeOneLogger, createContextAdapter } from '@notjustcoders/one-logger-client-sdk';

initializeOneLogger({
  name: 'my-app',
  tracer: {
    contextAdapter: createContextAdapter(), // Automatically detects environment
  }
});
```

The `createContextAdapter()` function automatically detects your environment:
- **Node.js**: Uses `AsyncLocalStorage` for proper async context propagation and isolation
- **Browser**: Falls back to a stack-based approach (note: browsers lack native APIs for async context isolation, making it impossible to maintain perfect span ordering across all async operations)

### Manual Context Adapter Configuration

```ts
import { initializeOneLogger, getContextAdapter, setContextAdapter } from '@notjustcoders/one-logger-client-sdk';

// Get the current context adapter
const adapter = getContextAdapter();

// Set a custom context adapter (useful for testing)
setContextAdapter(customAdapter);
```

### Benefits of Context Adapters

1. **Proper Span Nesting**: Maintains parent-child relationships across async operations
2. **Automatic Context Propagation**: No manual span passing required
3. **Framework Integration**: Works seamlessly with Express, Fastify, and other Node.js frameworks

### Example with Async Operations

```ts
const processOrder = wrappedSpan(
  'processOrder',
  async (orderId: string) => {
    // This span is automatically the parent
    logger.info('Processing order', { orderId });
    
    // These async operations maintain the span context
    const order = await fetchOrder(orderId); // Child span
    const payment = await processPayment(order); // Child span
    const shipping = await scheduleShipping(order); // Child span
    
    return { order, payment, shipping };
  }
);

const fetchOrder = wrappedSpan(
  'fetchOrder',
  async (orderId: string) => {
    // This automatically becomes a child of processOrder
    await new Promise(resolve => setTimeout(resolve, 100));
    return { id: orderId, items: ['item1', 'item2'] };
  }
);
```

**Without Context Adapter:**
```
[DEMO] Trace abc123
↳ processOrder ✓ (350ms)
[DEMO] Trace def456  // ❌ New trace - context lost
↳ fetchOrder ✓ (100ms)
```

**With Context Adapter:**
```
[DEMO] Trace abc123
↳ processOrder ✓ (350ms)
  ↳ fetchOrder ✓ (100ms)  // ✅ Proper nesting maintained
  ↳ processPayment ✓ (150ms)
  ↳ scheduleShipping ✓ (100ms)
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

**Wrapped Classes:**
```
[DEMO] Trace mno123-pqr456-stu789
↳ GreeterService.constructor ✓ (10ms) metadata: {"method":"constructor","argsCount":1,"type":"instance"}
↳ GreeterService.greet ✓ (5ms) metadata: {"method":"greet","argsCount":1,"type":"instance"}
↳ GreeterService.staticGreet ✓ (3ms) metadata: {"method":"staticGreet","argsCount":1,"type":"static"}
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