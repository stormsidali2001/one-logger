import { logger } from '@notjustcoders/one-logger-client-sdk';

export async function basicLoggingWorkflow(): Promise<void> {
  console.log('\n📝 Test 1: Basic Logging');
  
  logger.info('🚀 Starting Node.js logger test', { 
    timestamp: new Date().toISOString(),
    environment: 'nodejs',
    testType: 'basic-logging'
  });
  
  logger.debug('Debug message with metadata', { debugLevel: 1, component: 'test' });
  logger.warn('Warning message', { warningType: 'test', severity: 'low' });
  logger.error('Error message for testing', { errorCode: 'TEST_ERROR', stack: 'fake-stack-trace' });
  
  console.log('✅ Basic logging test completed');
}