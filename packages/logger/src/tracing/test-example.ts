#!/usr/bin/env node

/**
 * Test script to demonstrate the tracing functionality
 * Run with: node dist/tracing/test-example.js
 */

import { wrappedSpan, initializeTracing, ConsoleTraceTransport, flushTraces } from './index.js';

// Initialize tracing
initializeTracing({
  transport: new ConsoleTraceTransport('[DEMO]'),
  batchSize: 3,
  flushInterval: 2000
});

// Example functions with tracing
const fetchUser = wrappedSpan(
  'fetchUser',
  async (id: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 150));
    return { id, name: `User ${id}`, email: `user${id}@example.com` };
  },
  (id) => ({ userId: id, operation: 'fetch' })
);

const processUser = wrappedSpan(
  'processUser',
  async (user: any) => {
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 75));
    return {
      ...user,
      displayName: user.name.toUpperCase(),
      processed: true
    };
  },
  { layer: 'business-logic' }
);

const validateUser = wrappedSpan(
  'validateUser',
  (user: any) => {
    // Sync validation
    if (!user.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    return { ...user, validated: true };
  },
  { layer: 'validation' }
);

const getUserWorkflow = wrappedSpan(
  'getUserWorkflow',
  async (id: string) => {
    const user = await fetchUser(id);
    const processedUser = await processUser(user);
    const validatedUser = validateUser(processedUser);
    return validatedUser;
  },
  (id) => ({ workflowId: `workflow-${id}`, type: 'user-processing' })
);

// Test function with error handling
const errorExample = wrappedSpan(
  'errorExample',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    throw new Error('Simulated error for testing');
  },
  { testCase: 'error-handling' }
);

// Main test function
async function runDemo() {
  console.log('🚀 Starting Tracing Demo\n');

  try {
    // Test successful workflow
    console.log('📋 Testing successful workflow...');
    const result1 = await getUserWorkflow('123');
    console.log('✅ Workflow completed:', result1.displayName);

    // Test another workflow
    console.log('\n📋 Testing another workflow...');
    const result2 = await getUserWorkflow('456');
    console.log('✅ Workflow completed:', result2.displayName);

    // Test error handling
    console.log('\n📋 Testing error handling...');
    try {
      await errorExample();
    } catch (error) {
      console.log('✅ Error handled correctly:', (error as Error).message);
    }

    // Force flush remaining traces
    console.log('\n🔄 Flushing remaining traces...');
    await flushTraces();

    console.log('\n✨ Demo completed successfully!');
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(console.error);
}

export { runDemo };