import { logger, wrappedClass } from '@notjustcoders/one-logger-client-sdk';

class GreeterService {
  public greeting: string;

  constructor(greeting: string) {
    this.greeting = greeting;
    logger.info('GreeterService initialized', { greeting, classInstanceId: Math.random().toString(36).substring(7) });
    // Simulate some constructor work
    for (let i = 0; i < 1e5; i++) { Math.sqrt(i); }
  }

  greet(name: string): string {
    // Simulate some work
    for (let i = 0; i < 5e4; i++) { Math.sqrt(i); }
    const message = `${this.greeting}, ${name}!`;
    logger.info('Greeting generated', { name, message, method: 'greet' });
    return message;
  }

  async asyncGreet(name: string): Promise<string> {
    logger.info('Async greeting started', { name });
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50)); // Simulate async work
    const message = `Async ${this.greeting}, ${name}!`;
    logger.info('Async greeting completed', { name, message, method: 'asyncGreet' });
    return message;
  }

  static staticGreet(name: string): string {
    // Simulate some static work
    for (let i = 0; i < 3e4; i++) { Math.sqrt(i); }
    const message = `Hello from static, ${name}!`;
    logger.info('Static greeting generated', { name, message, method: 'staticGreet' });
    return message;
  }

  static async asyncStaticGreet(name: string): Promise<string> {
    logger.info('Async static greeting started', { name });
    await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 40)); // Simulate async static work
    const message = `Async static hello, ${name}!`;
    logger.info('Async static greeting completed', { name, message, method: 'asyncStaticGreet' });
    return message;
  }
}

const TracedGreeterService = wrappedClass(
  'GreeterService',
  GreeterService,
  (methodName, ...args) => ({
    method: methodName,
    args: args.map(arg => typeof arg === 'string' && arg.length > 50 ? arg.substring(0, 50) + '...' : arg),
    source: 'wrappedClassDemo',
  })
);

export async function demonstrateWrappedClass() {
  logger.info('🎬 Starting wrappedClass demonstration');
  
  const greeterInstance = new TracedGreeterService('Hey there');
  const syncResult1 = greeterInstance.greet('Alice');
  const asyncResult1 = await greeterInstance.asyncGreet('Bob');
  
  const staticSyncResult = TracedGreeterService.staticGreet('Charlie');
  const staticAsyncResult = await TracedGreeterService.asyncStaticGreet('Diana');

  const results = {
    syncResult1,
    asyncResult1,
    staticSyncResult,
    staticAsyncResult,
    instanceGreeting: (greeterInstance ).greeting // Accessing private member for demo
  };
  
  logger.info('🏁 Finished wrappedClass demonstration', { results });
  return results;
}