import type { Span } from './span.js';

/**
 * Interface for context adapters that handle async context management
 */
export interface ContextAdapter {
  /**
   * Initialize the context adapter
   */
  initialize(): void;

  /**
   * Check if the adapter supports async context
   */
  supportsAsyncContext(): boolean;

  /**
   * Run a function within a span context
   */
  runWithSpan<T>(span: Span, fn: () => T): T;

  /**
   * Set the current span in the context
   */
  setCurrentSpan(span: Span): void;

  /**
   * Get the current span from the context
   */
  getCurrentSpan(): Span | null;

  /**
   * Clear the current span from the context
   */
  clearCurrentSpan(): void;

  /**
   * Clean up resources
   */
  cleanup(): void;
}

/**
 * Node.js implementation using AsyncLocalStorage
 */
class NodeContextAdapter implements ContextAdapter {
  private asyncLocalStorage: any;
  private isInitialized = false;

  initialize(): void {
    if (this.isInitialized) return;
    
    try {
      // Dynamically import async_hooks to avoid issues in browser environments
      const { AsyncLocalStorage } =  require('async_hooks');
      this.asyncLocalStorage = new AsyncLocalStorage();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize Node.js context adapter:', error);
      throw new Error('AsyncLocalStorage not available in this environment');
    }
  }

  runWithSpan<T>(span: Span, fn: () => T): T {
    if (!this.isInitialized) {
      throw new Error('Context adapter not initialized');
    }
    return this.asyncLocalStorage.run(span, fn);
  }

  getCurrentSpan(): Span | null {
    if (!this.isInitialized) {
      return null;
    }
    
    const spanStack: Span[] = this.asyncLocalStorage.getStore() || [];
    return spanStack[spanStack.length - 1] || null;
  }

  setCurrentSpan(span: Span): void {
    if (!this.isInitialized) {
      return;
    }
    
    // Get current span stack from AsyncLocalStorage or create new one
    const currentStack: Span[] = this.asyncLocalStorage.getStore() || [];
    const newStack = [...currentStack, span];
    
    // Store the updated stack in AsyncLocalStorage
    this.asyncLocalStorage.enterWith(newStack);
  }

  clearCurrentSpan(): void {
    if (!this.isInitialized) {
      return;
    }
    
    // Get current span stack from AsyncLocalStorage
    const currentStack: Span[] = this.asyncLocalStorage.getStore() || [];
    if (currentStack.length === 0) {
      return;
    }
    
    // Remove the last span and store updated stack
    const newStack = currentStack.slice(0, -1);
    this.asyncLocalStorage.enterWith(newStack.length > 0 ? newStack : null);
  }

  supportsAsyncContext(): boolean {
    return this.isInitialized;
  }

  cleanup(): void {
    this.isInitialized = false;
  }
}

/**
 * Browser implementation using a stack-based approach
 */
class BrowserContextAdapter implements ContextAdapter {
  private spanStack: Span[] = [];
  private isInitialized = false;

  initialize(): void {
    this.isInitialized = true;
  }

  runWithSpan<T>(span: Span, fn: () => T): T {
    this.spanStack.push(span);
    try {
      return fn();
    } finally {
      this.spanStack.pop();
    }
  }

  getCurrentSpan(): Span | null {
    return this.spanStack[this.spanStack.length - 1] || null;
  }

  setCurrentSpan(span: Span): void {
    this.spanStack.push(span);
  }

  clearCurrentSpan(): void {
    this.spanStack.pop();
  }

  supportsAsyncContext(): boolean {
    return false; // Browser stack-based approach doesn't support automatic async context
  }

  cleanup(): void {
    this.spanStack = [];
    this.isInitialized = false;
  }
}

/**
 * Factory function to create the appropriate context adapter
 * based on the current environment
 */
export function createContextAdapter(): ContextAdapter {
  // Check if we're in a Node.js environment
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    try {
      const adapter = new NodeContextAdapter();
      adapter.initialize();
      return adapter;
    } catch (error) {
      console.warn('Failed to create Node.js context adapter, falling back to browser adapter:', error);
    }
  }
  
  // Fallback to browser adapter
  const adapter = new BrowserContextAdapter();
  adapter.initialize();
  return adapter;
}

/**
 * Global context adapter instance
 */
let globalContextAdapter: ContextAdapter | undefined;

/**
 * Get the global context adapter instance
 */
export function getContextAdapter(): ContextAdapter {
  if (!globalContextAdapter) {
    globalContextAdapter = createContextAdapter();
  }
  return globalContextAdapter;
}

/**
 * Set a custom context adapter (useful for testing)
 */
export function setContextAdapter(adapter: ContextAdapter): void {
  globalContextAdapter = adapter;
}