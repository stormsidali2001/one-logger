import { logger, wrappedSpan, getCurrentSpan } from '@notjustcoders/one-logger-client-sdk';

// Test wrapped span functionality
const asyncOperation = wrappedSpan(
  'asyncOperation',
  async (operationId: string, delay: number = 1000) => {
    logger.info('🔄 Starting async operation', { operationId, delay });
    
    // Simulate async work
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const result = {
      operationId,
      result: `Operation ${operationId} completed`,
      timestamp: new Date().toISOString()
    };
    
    logger.info('✅ Async operation completed', result);
    return result;
  },
  (operationId, delay) => ({ operationId, delay, type: 'async-test' })
);

// Test context propagation in Node.js
const testContextPropagation = wrappedSpan(
  'testContextPropagation',
  async () => {
    logger.info('🧪 Testing context propagation in Node.js');
    
    // Get current span to verify context
    const currentSpan = getCurrentSpan();
    logger.info('📍 Current span info', { 
      spanId: currentSpan?.id,
      spanName: currentSpan?.name,
      hasAsyncContext: !!currentSpan
    });
    
    // Test Promise.all with multiple async operations
    const results = await Promise.all([
      asyncOperation('parallel-1', 200),
      asyncOperation('parallel-2', 150),
      asyncOperation('parallel-3', 100)
    ]);
    
    logger.info('🔄 Parallel operations completed', { 
      resultCount: results.length,
      operationIds: results.map(r => r.operationId)
    });
    
    return results;
  },
  { type: 'context-propagation-test' }
);

export async function contextPropagationWorkflow(): Promise<void> {
  console.log('\n🧪 Test 6: Context Propagation');
  
  await testContextPropagation();
  
  console.log('✅ Context propagation test completed');
}