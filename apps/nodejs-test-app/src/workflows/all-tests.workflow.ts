import { logger } from '@notjustcoders/one-logger-client-sdk';
import { basicLoggingWorkflow } from './basic-logging.workflow.js';
import { wrappedSpanWorkflow } from './wrapped-span.workflow.js';
import { nestedOperationsWorkflow } from './nested-operations.workflow.js';
import { wrappedObjectWorkflow } from './wrapped-object.workflow.js';
import { wrappedClassWorkflow } from './wrapped-class.workflow.js';
import { contextPropagationWorkflow } from './context-propagation.workflow.js';
import { manualSpansWorkflow } from './manual-spans.workflow.js';
import { errorHandlingWorkflow } from './error-handling.workflow.js';
import { expressContextTestWorkflow } from './express-context-test.workflow.js';

export async function allTestsWorkflow(): Promise<void> {
  try {
    logger.info('🎬 Starting Node.js One Logger Test Suite', {
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString()
    });
    
    // Run all tests sequentially
    await basicLoggingWorkflow();
    await wrappedSpanWorkflow();
    await nestedOperationsWorkflow();
    await wrappedObjectWorkflow();
    await wrappedClassWorkflow();
    await contextPropagationWorkflow();
    await manualSpansWorkflow();
    await errorHandlingWorkflow();
    await expressContextTestWorkflow();
    
    logger.info('🎉 All tests completed successfully!');
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    logger.error('💥 Test suite failed', { 
      error: (error as Error).message,
      stack: (error as Error).stack
    });
    throw error;
  }
}