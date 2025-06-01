import { wrappedSpan, logger } from '@notjustcoders/one-logger-client-sdk';
import {
  fetchUserData,
  fetchUserProfile,
  processUserData,
  validateUserData,
  enrichUserData,
  performHeavyAnalytics,
  cacheUserData
} from '../services/tracedFunctions';

// Different workflow scenarios
export const quickUserWorkflow = wrappedSpan(
  'quickUserWorkflow',
  async (userId: string) => {
    logger.info('🚀 Starting quick user workflow', { userId, workflowType: 'quick' });
    
    const userData = await fetchUserData(userId);
    const validatedData = await validateUserData(userData);
    await cacheUserData(validatedData);
    
    logger.info('✅ Quick user workflow completed successfully', { 
      userId, 
      workflowType: 'quick',
      steps: ['fetch', 'validate', 'cache']
    });
    
    return validatedData;
  },
  (userId) => ({ workflowId: `quick-${userId}`, type: 'quick-processing' })
);

export const standardUserWorkflow = wrappedSpan(
  'standardUserWorkflow',
  async (userId: string) => {
    const userData = await fetchUserData(userId);
    const processedData = await processUserData(userData);
    const validatedData = await validateUserData(processedData);
    const enrichedData = await enrichUserData(validatedData);
    await cacheUserData(enrichedData);
    return enrichedData;
  },
  (userId) => ({ workflowId: `standard-${userId}`, type: 'standard-processing' })
);

export const comprehensiveUserWorkflow = wrappedSpan(
  'comprehensiveUserWorkflow',
  async (userId: string) => {
    // Parallel operations for better performance
    const [userData, userProfile] = await Promise.all([
      fetchUserData(userId),
      fetchUserProfile(userId)
    ]);
    
    const processedData = await processUserData(userData);
    const validatedData = await validateUserData(processedData);
    const enrichedData = await enrichUserData(validatedData);
    
    // Heavy analytics in parallel with caching
    const [analytics] = await Promise.all([
      performHeavyAnalytics(enrichedData),
      cacheUserData(enrichedData)
    ]);
    
    return {
      ...enrichedData,
      profile: userProfile,
      ...analytics
    };
  },
  (userId) => ({ workflowId: `comprehensive-${userId}`, type: 'comprehensive-processing' })
);

// Level 3 function - Will throw an error
const criticalDataValidation = wrappedSpan(
  'criticalDataValidation',
  async (data: any) => {
    logger.info('🔍 Starting critical data validation', { dataKeys: Object.keys(data) });
    
    // Simulate validation processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
    
    // Intentionally throw an error to demonstrate error tracing
    const errorMessage = 'Critical validation failed: Data integrity check failed';
    logger.error('❌ Critical validation error detected', { 
      error: errorMessage,
      dataId: data.id,
      validationLevel: 'critical'
    });
    
    throw new Error(errorMessage);
  },
  { layer: 'validation', level: 3 }
);

// Level 2 function - Calls level 3
const dataProcessingPipeline = wrappedSpan(
  'dataProcessingPipeline',
  async (userData: any) => {
    logger.info('⚙️ Starting data processing pipeline', { userId: userData.id });
    
    // Simulate some processing
    await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 300));
    
    const processedData = {
      ...userData,
      processed: true,
      processedAt: new Date().toISOString(),
      pipeline: 'advanced'
    };
    
    logger.info('🔄 Data processing completed, starting validation', { userId: userData.id });
    
    // This will throw an error at level 3
    await criticalDataValidation(processedData);
    
    return processedData;
  },
  { layer: 'processing', level: 2 }
);

// Level 1 function - Calls level 2
const errorProneWorkflow = wrappedSpan(
  'errorProneWorkflow',
  async (userId: string) => {
    logger.info('🚀 Starting error-prone workflow', { userId, workflowType: 'error-prone' });
    
    try {
      // Fetch user data first
      const userData = await fetchUserData(userId);
      logger.info('✅ User data fetched successfully', { userId });
      
      // This will eventually fail at level 3
      const result = await dataProcessingPipeline(userData);
      
      logger.info('✅ Error-prone workflow completed successfully', { userId });
      return result;
    } catch (error) {
      logger.error('💥 Error-prone workflow failed', { 
        userId,
        error: (error as Error).message,
        workflowType: 'error-prone'
      });
      
      // Re-throw to let the caller handle it
      throw error;
    }
  },
  (userId) => ({ workflowId: `error-prone-${userId}`, type: 'error-prone-processing', maxDepth: 3 })
);

export { errorProneWorkflow };