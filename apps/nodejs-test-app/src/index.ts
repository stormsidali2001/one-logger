import inquirer from 'inquirer';
import { logger, initializeOneLogger, createContextAdapter } from '@notjustcoders/one-logger-client-sdk';
import { basicLoggingWorkflow } from './workflows/basic-logging.workflow.js';
import { wrappedSpanWorkflow } from './workflows/wrapped-span.workflow.js';
import { nestedOperationsWorkflow } from './workflows/nested-operations.workflow.js';
import { wrappedObjectWorkflow } from './workflows/wrapped-object.workflow.js';
import { wrappedClassWorkflow } from './workflows/wrapped-class.workflow.js';
import { contextPropagationWorkflow } from './workflows/context-propagation.workflow.js';
import { manualSpansWorkflow } from './workflows/manual-spans.workflow.js';
import { errorHandlingWorkflow } from './workflows/error-handling.workflow.js';
import { expressContextTestWorkflow } from './workflows/express-context-test.workflow.js';
import { allTestsWorkflow } from './workflows/all-tests.workflow.js';

// Initialize the logger
initializeOneLogger({
  name: 'nodejs-test-app',
  description: 'Node.js test application for One Logger',
  isDev: true, // Use console transport for development


  tracer: {
    batchSize: 1,
    flushInterval: 5000,
    useHttpTransport: true, // Use console transport for dev
    contextAdapter: createContextAdapter(), // Use Node.js context adapter for proper async context propagation
  },

});

// Workflow options
const workflows = {
  'basic-logging': {
    name: '📝 Basic Logging',
    description: 'Test basic logging functionality (debug, info, warn, error)',
    handler: basicLoggingWorkflow
  },
  'wrapped-span': {
    name: '🎯 Wrapped Span',
    description: 'Test wrapped span functionality with async operations',
    handler: wrappedSpanWorkflow
  },
  'nested-operations': {
    name: '🔗 Nested Operations',
    description: 'Test nested spans and operation chaining',
    handler: nestedOperationsWorkflow
  },
  'wrapped-object': {
    name: '📦 Wrapped Object',
    description: 'Test wrapped object functionality',
    handler: wrappedObjectWorkflow
  },
  'wrapped-class': {
    name: '🏭 Wrapped Class',
    description: 'Test wrapped class functionality',
    handler: wrappedClassWorkflow
  },
  'context-propagation': {
    name: '🧪 Context Propagation',
    description: 'Test context propagation in Node.js async operations',
    handler: contextPropagationWorkflow
  },
  'manual-spans': {
    name: '🔧 Manual Spans',
    description: 'Test manual span creation and management',
    handler: manualSpansWorkflow
  },
  'error-handling': {
    name: '💥 Error Handling',
    description: 'Test error handling within wrapped spans',
    handler: errorHandlingWorkflow
  },
  'express-context-test': {
    name: '🏗️ Express Context Test',
    description: 'Test context propagation with Express-like 3-layer architecture (Route->UseCase->Repository)',
    handler: expressContextTestWorkflow
  },
  'all-tests': {
    name: '🎉 Run All Tests',
    description: 'Execute all test workflows sequentially',
    handler: allTestsWorkflow
  }
};

async function selectAndRunWorkflow() {
  try {
    console.log('\n🎬 Welcome to One Logger Test Suite!');
    console.log('Select a workflow to execute:\n');
    
    const { selectedWorkflow } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedWorkflow',
        message: 'Choose a test workflow:',
        choices: Object.entries(workflows).map(([key, workflow]) => ({
          name: `${workflow.name} - ${workflow.description}`,
          value: key
        })),
        pageSize: 10
      }
    ]);
    
    const workflow = workflows[selectedWorkflow as keyof typeof workflows];
    
    console.log(`\n🚀 Starting: ${workflow.name}`);
    console.log(`📋 Description: ${workflow.description}\n`);
    
    logger.info('🎬 Starting workflow execution', {
      workflowName: workflow.name,
      workflowKey: selectedWorkflow,
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString()
    });
    
    await workflow.handler();
    
    console.log(`\n✅ Workflow completed: ${workflow.name}`);
    logger.info('🎉 Workflow completed successfully!', {
      workflowName: workflow.name,
      workflowKey: selectedWorkflow
    });
    
  } catch (error) {
    logger.error('💥 Workflow execution failed', { 
      error: (error as Error).message,
      stack: (error as Error).stack
    });
    console.error('\n💥 Workflow execution failed:', (error as Error).message);
    throw error;
  } finally {
    // Flush logs and traces
    await new Promise(resolve => setTimeout(resolve, 2000));
    logger.info('🔄 Flushing logs and traces...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Run the workflow selector
selectAndRunWorkflow().catch(console.error);