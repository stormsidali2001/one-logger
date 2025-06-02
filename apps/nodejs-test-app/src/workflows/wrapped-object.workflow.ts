import { logger, wrappedObject } from '@notjustcoders/one-logger-client-sdk';

// Test wrapped object
class TestService {
  async fetchData(id: string): Promise<any> {
    logger.info('📡 Fetching data', { id });
    await new Promise(resolve => setTimeout(resolve, 200));
    return { id, data: `Data for ${id}`, fetchedAt: new Date().toISOString() };
  }
  
  async processData(data: any): Promise<any> {
    logger.info('⚙️ Processing data', { dataId: data.id });
    await new Promise(resolve => setTimeout(resolve, 150));
    return { ...data, processed: true, processedAt: new Date().toISOString() };
  }
  
  validateData(data: any): boolean {
    logger.info('🔍 Validating data', { dataId: data.id });
    return data.id && data.data;
  }
}

export async function wrappedObjectWorkflow(): Promise<void> {
  console.log('\n📦 Test 4: Wrapped Object');
  
  const service = new TestService();
  const wrappedService = wrappedObject(
    'TestService',
    service,
    (methodName, ...args) => ({
      method: methodName,
      argsCount: args.length,
      layer: 'service'
    })
  );
  
  const data = await wrappedService.fetchData('test-id-1');
  const processedData = await wrappedService.processData(data);
  const isValid = wrappedService.validateData(processedData);
  
  logger.info('📦 Wrapped object test completed', { isValid, processedData });
  console.log('✅ Wrapped object test completed');
}