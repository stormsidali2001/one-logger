import { logger, wrappedClass } from '@notjustcoders/one-logger-client-sdk';

// Test wrapped class
class WrappedTestService {
  constructor(private serviceName: string) {
    logger.info('🏭 Creating service instance', { serviceName });
  }
  
  async performTask(taskName: string): Promise<any> {
    logger.info('📋 Performing task', { serviceName: this.serviceName, taskName });
    await new Promise(resolve => setTimeout(resolve, 300));
    return { serviceName: this.serviceName, taskName, completed: true };
  }
}

export async function wrappedClassWorkflow(): Promise<void> {
  console.log('\n🏭 Test 5: Wrapped Class');
  
  const WrappedServiceClass = wrappedClass(
    'WrappedTestService',
    WrappedTestService,
    (methodName, ...args) => ({
      method: methodName,
      argsCount: args.length,
      type: methodName === 'constructor' || WrappedTestService.prototype.hasOwnProperty(methodName) ? 'instance' : 'static'
    })
  );
  
  const wrappedServiceInstance = new WrappedServiceClass('test-service');
  await wrappedServiceInstance.performTask('test-task-1');
  
  console.log('✅ Wrapped class test completed');
}