import { logger, wrappedSpan } from '@notjustcoders/one-logger-client-sdk';

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

export async function wrappedSpanWorkflow(): Promise<void> {
  console.log('\n🔄 Test 2: Simple Wrapped Span');
  
  await asyncOperation('test-operation-1', 500);
  
  console.log('✅ Wrapped span test completed');
}