import { logger, createSpan, getCurrentSpan } from '@notjustcoders/one-logger-client-sdk';

// Test manual span creation
async function testManualSpans() {
  const span = createSpan('manualSpan', { type: 'manual', operation: 'test' });
  
  try {
    logger.info('🔧 Testing manual span creation');
    
    // Use runWithContext if available (Node.js with async context)
    if ('runWithContext' in span && typeof span.runWithContext === 'function') {
      logger.info('✨ Using runWithContext for proper async context');
      
      await span.runWithContext(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        logger.info('🎯 Inside manual span context');
        
        const currentSpan = getCurrentSpan();
        logger.info('📍 Manual span context check', {
          currentSpanId: currentSpan?.id,
          manualSpanId: span.span.id,
          contextMatches: currentSpan?.id === span.span.id
        });
      });
    } else {
      logger.info('⚠️ runWithContext not available, using basic span');
      await new Promise(resolve => setTimeout(resolve, 100));
      logger.info('🎯 Manual span without context');
    }
    
  } finally {
    span.finish();
  }
}

export async function manualSpansWorkflow(): Promise<void> {
  console.log('\n🔧 Test 7: Manual Spans');
  
  await testManualSpans();
  
  console.log('✅ Manual spans test completed');
}