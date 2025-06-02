import { logger, wrappedSpan } from '@notjustcoders/one-logger-client-sdk';

export async function errorHandlingWorkflow(): Promise<void> {
  console.log('\n💥 Test 8: Error Handling');
  
  const errorOperation = wrappedSpan(
    'errorOperation',
    async () => {
      logger.info('🚨 Simulating error');
      throw new Error('Test error for tracing');
    },
    { type: 'error-test' }
  );
  
  try {
    await errorOperation();
  } catch (error) {
    logger.error('❌ Caught expected error', { 
      error: (error as Error).message,
      stack: (error as Error).stack
    });
  }
  
  console.log('✅ Error handling test completed');
}