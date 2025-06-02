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

// Test nested spans
const nestedOperation = wrappedSpan(
  'nestedOperation',
  async (taskId: string) => {
    logger.info('🏗️ Starting nested operation', { taskId });
    
    // Call another wrapped function to test span nesting
    const result1 = await asyncOperation(`${taskId}-subtask-1`, 500);
    const result2 = await asyncOperation(`${taskId}-subtask-2`, 300);
    
    logger.info('🎯 Nested operation completed', { taskId, subtasks: 2 });
    return { taskId, subtasks: [result1, result2] };
  },
  (taskId) => ({ taskId, type: 'nested-operation' })
);

export async function nestedOperationsWorkflow(): Promise<void> {
  console.log('\n🏗️ Test 3: Nested Operations');
  
  await nestedOperation('nested-test-1');
  
  console.log('✅ Nested operations test completed');
}