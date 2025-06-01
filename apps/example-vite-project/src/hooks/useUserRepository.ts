import { wrappedSpan } from '@notjustcoders/one-logger-client-sdk';
import { logger } from '../config/logger';
import { wrappedUserRepository } from '../services/wrappedUserRepository';

// Custom hook that uses the wrapped repository - wrapped itself
const useUserRepositoryHook = () => {
  // Sequential workflow that calls all three methods
  const processUserWorkflow = wrappedSpan(

    'processUserWorkflow',
    async (userId: string) => {
      logger.info('🚀 Starting repository workflow', { userId });
      
      // Step 1: Fetch user data
      const userData = await wrappedUserRepository.fetchUserData(userId);
      
      // Step 2: Enrich the data
      const enrichedData = await wrappedUserRepository.enrichUserData(userData);
      
      // Step 3: Cache the enriched data
      const finalResult = await wrappedUserRepository.cacheUserData(enrichedData);
      
      logger.info('🎉 Repository workflow completed', { 
        userId, 
        steps: ['fetch', 'enrich', 'cache'],
        finalDataKeys: Object.keys(finalResult)
      });
      
      return finalResult;
    },
    {
      logger,
      logLevel: 'info'
    }
  );

  return {
    processUserWorkflow
  };
};

// Export the wrapped hook
export const useUserRepository = wrappedSpan(
  'useUserRepository',

  useUserRepositoryHook,
  {
    logger,
    logLevel: 'info'
  }
);

export default useUserRepository;