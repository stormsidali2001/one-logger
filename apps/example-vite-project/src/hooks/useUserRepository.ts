import { wrappedSpan } from '@notjustcoders/one-logger-client-sdk';
import { logger } from '../config/logger';
import { wrappedUserRepository } from '../services/wrappedUserRepository';
import { useMemo } from 'react';

// Custom hook that uses the wrapped repository
export const useUserRepository = () => {
  // Create the wrapped workflow function only once using useMemo
  const processUserWorkflow = useMemo(() => {
    return wrappedSpan(
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
  }, []); // Empty dependency array ensures this is created only once

  return {
    processUserWorkflow
  };
};

export default useUserRepository;