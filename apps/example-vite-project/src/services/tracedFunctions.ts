import { wrappedSpan, logger } from '@notjustcoders/one-logger-client-sdk';

// Example traced functions with varying execution times
export const fetchUserData = wrappedSpan(
  'fetchUserData',
  async (userId: string) => {
    logger.info('📡 Starting user data fetch', { userId, operation: 'fetch' });
    
    // Simulate API call with variable delay
    const delay = Math.random() * 800 + 500; // 500-1300ms
    logger.log(`⏱️ Simulating API delay: ${delay.toFixed(0)}ms`, { delay, userId });
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const userData = {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`
    };
    
    logger.info('✅ User data fetched successfully', { userData, duration: delay });
    return userData;
  },
  (userId) => ({ userId, operation: 'fetch' })
);

export const fetchUserProfile = wrappedSpan(
  'fetchUserProfile',
  async (userId: string) => {
    // Simulate slower profile API call
    const delay = Math.random() * 1200 + 800; // 800-2000ms
    await new Promise(resolve => setTimeout(resolve, delay));
    return {
      userId,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      preferences: { theme: 'dark', language: 'en' },
      lastLogin: new Date().toISOString()
    };
  },
  (userId) => ({ userId, operation: 'profile-fetch' })
);

export const processUserData = wrappedSpan(
  'processUserData',
  async (userData: any) => {
    // Simulate data processing with variable complexity
    const delay = Math.random() * 600 + 300; // 300-900ms
    await new Promise(resolve => setTimeout(resolve, delay));
    return {
      ...userData,
      displayName: userData.name.toUpperCase(),
      processed: true,
      processedAt: new Date().toISOString()
    };
  },
  { layer: 'business-logic' }
);

export const validateUserData = wrappedSpan(
  'validateUserData',
  async (userData: any) => {
    logger.info('🔍 Starting user data validation', { userId: userData.id, email: userData.email });
    
    // Simulate validation processing time
    const delay = Math.random() * 300 + 200; // 200-500ms
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (!userData.email.includes('@')) {
      logger.error('❌ Email validation failed', { 
        email: userData.email, 
        reason: 'Missing @ symbol',
        userId: userData.id 
      });
      throw new Error('Invalid email format');
    }
    
    logger.info('✅ User data validation passed', { userId: userData.id, validationTime: delay });
    return { ...userData, validated: true };
  },
  { layer: 'validation' }
);

export const enrichUserData = wrappedSpan(
  'enrichUserData',
  async (userData: any) => {
    // Simulate data enrichment - medium duration
    const delay = Math.random() * 800 + 600; // 600-1400ms
    await new Promise(resolve => setTimeout(resolve, delay));
    return {
      ...userData,
      enriched: true,
      score: Math.floor(Math.random() * 100),
      tags: ['active', 'verified']
    };
  },
  { layer: 'enrichment' }
);

export const performHeavyAnalytics = wrappedSpan(
  'performHeavyAnalytics',
  async (userData: any) => {
    // Simulate heavy analytics processing - long duration
    const delay = Math.random() * 2000 + 1500; // 1500-3500ms
    
    logger.warn('⚠️ Starting heavy analytics processing - this may take a while', { 
      userId: userData.id, 
      estimatedDuration: `${(delay/1000).toFixed(1)}s`,
      priority: 'low'
    });
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const analytics = {
      riskScore: Math.random(),
      behaviorPattern: 'normal',
      recommendations: ['feature-a', 'feature-b']
    };
    
    logger.info('📊 Heavy analytics processing completed', { 
      userId: userData.id, 
      actualDuration: `${(delay/1000).toFixed(1)}s`,
      riskScore: analytics.riskScore,
      recommendations: analytics.recommendations.length
    });
    
    return { analytics };
  },
  { layer: 'analytics', priority: 'low' }
);

export const cacheUserData = wrappedSpan(
  'cacheUserData',
  async (userData: any) => {
    // Simulate caching operation - fast
    const delay = Math.random() * 200 + 100; // 100-300ms
    await new Promise(resolve => setTimeout(resolve, delay));
    return { cached: true, cacheKey: `user_${userData.id}` };
  },
  { layer: 'cache' }
);