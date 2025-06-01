import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { initializeOneLogger, wrappedSpan, flushTraces, logger } from '@notjustcoders/one-logger-client-sdk'


console.log("hello")

// Initialize One Logger with both logging and tracing
logger.info('🚀 Starting One Logger initialization...');
initializeOneLogger({
  name: 'vite-example-app',
  description: 'Example Vite React app with One Logger tracing',
  isDev: true, // Use console transport for development
  tracer: {
    batchSize: 1, // Flush traces immediately for demo
    flushInterval: 5000, // Flush every second
    useHttpTransport:true  // Use console transport
  }
});

logger.info('✅ One Logger initialized successfully!', {
  appName: 'vite-example-app',
  features: ['logging', 'tracing'],
  environment: 'development'
});

// Example traced functions with varying execution times
const fetchUserData = wrappedSpan(
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

const fetchUserProfile = wrappedSpan(
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

const processUserData = wrappedSpan(
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

const validateUserData = wrappedSpan(
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

const enrichUserData = wrappedSpan(
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

const performHeavyAnalytics = wrappedSpan(
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

const cacheUserData = wrappedSpan(
  'cacheUserData',
  async (userData: any) => {
    // Simulate caching operation - fast
    const delay = Math.random() * 200 + 100; // 100-300ms
    await new Promise(resolve => setTimeout(resolve, delay));
    return { cached: true, cacheKey: `user_${userData.id}` };
  },
  { layer: 'cache' }
);

// Different workflow scenarios
const quickUserWorkflow = wrappedSpan(
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

const standardUserWorkflow = wrappedSpan(
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

const comprehensiveUserWorkflow = wrappedSpan(
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

// Level 6 functions - Deepest level operations
const connectionManagement = wrappedSpan(
  'connectionManagement',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { connected: true };
  },
  { layer: 'infrastructure' }
);

const queryExecution = wrappedSpan(
  'queryExecution',
  async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { id: userId, name: `User ${userId}`, email: `user${userId}@example.com` };
  },
  { layer: 'database' }
);

const authenticationService = wrappedSpan(
  'authenticationService',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { authenticated: true, permissions: ['read', 'write'] };
  },
  { layer: 'auth' }
);

const profileService = wrappedSpan(
  'profileService',
  async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`, theme: 'dark' };
  },
  { layer: 'profile' }
);

const schemaValidation = wrappedSpan(
  'schemaValidation',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return { valid: true };
  },
  { layer: 'validation' }
);

const businessRulesValidation = wrappedSpan(
  'businessRulesValidation',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { businessRulesValid: true };
  },
  { layer: 'validation' }
);

const formatStandardization = wrappedSpan(
  'formatStandardization',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 250));
    return { standardized: true };
  },
  { layer: 'normalization' }
);

const textAnalysis = wrappedSpan(
  'textAnalysis',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { sentiment: 'positive', keywords: ['user', 'active'] };
  },
  { layer: 'ml-text' }
);

const behavioralAnalysis = wrappedSpan(
  'behavioralAnalysis',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { pattern: 'normal', riskScore: 0.1 };
  },
  { layer: 'ml-behavior' }
);

const predictionModel = wrappedSpan(
  'predictionModel',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return { prediction: 'high_value_user', confidence: 0.85 };
  },
  { layer: 'ml-prediction' }
);

// Level 5 functions - Composed operations
const databaseOperations = wrappedSpan(
  'databaseOperations',
  async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    await connectionManagement();
    const queryResult = await queryExecution(userId);
    return queryResult;
  },
  { layer: 'database' }
);

const externalServiceCalls = wrappedSpan(
  'externalServiceCalls',
  async (userId: string) => {
    const authData = await authenticationService();
    const profileData = await profileService(userId);
    return { ...authData, ...profileData };
  },
  { layer: 'external' }
);

const validationPipeline = wrappedSpan(
  'validationPipeline',
  async (dataLayer: any) => {
    await schemaValidation();
    await businessRulesValidation();
    return dataLayer;
  },
  { layer: 'validation' }
);

const dataNormalization = wrappedSpan(
  'dataNormalization',
  async (validatedData: any) => {
    await formatStandardization();
    return {
      ...validatedData,
      normalized: true,
      processedAt: new Date().toISOString()
    };
  },
  { layer: 'normalization' }
);

const featureExtraction = wrappedSpan(
  'featureExtraction',
  async () => {
    await textAnalysis();
    await behavioralAnalysis();
    return { featuresExtracted: true };
  },
  { layer: 'ml-features' }
);

const modelInference = wrappedSpan(
  'modelInference',
  async () => {
    const prediction = await predictionModel();
    return prediction;
  },
  { layer: 'ml-inference' }
);

// Level 4 functions - Higher level operations
const userDataFetching = wrappedSpan(
  'userDataFetching',
  async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const dbOps = await databaseOperations(userId);
    return dbOps;
  },
  { layer: 'data-access' }
);

const metadataEnrichment = wrappedSpan(
  'metadataEnrichment',
  async (userId: string) => {
    const externalData = await externalServiceCalls(userId);
    return externalData;
  },
  { layer: 'enrichment' }
);

const dataTransformation = wrappedSpan(
  'dataTransformation',
  async (dataLayer: any) => {
    const validatedData = await validationPipeline(dataLayer);
    const normalizedData = await dataNormalization(validatedData);
    return normalizedData;
  },
  { layer: 'transformation' }
);

const machineLearningPipeline = wrappedSpan(
  'machineLearningPipeline',
  async () => {
    const features = await featureExtraction();
    const inference = await modelInference();
    return { features, inference };
  },
  { layer: 'ml-pipeline' }
);

// Level 3 functions - Domain operations
const primaryDataSources = wrappedSpan(
  'primaryDataSources',
  async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const userData = await userDataFetching(userId);
    const metadata = await metadataEnrichment(userId);
    return { userData, metadata };
  },
  { layer: 'data-sources' }
);

const processingLayer = wrappedSpan(
  'processingLayer',
  async (dataLayer: any) => {
    const transformedData = await dataTransformation(dataLayer);
    return transformedData;
  },
  { layer: 'processing' }
);

const analyticsLayer = wrappedSpan(
  'analyticsLayer',
  async () => {
    const mlResult = await machineLearningPipeline();
    return mlResult;
  },
  { layer: 'analytics' }
);

// Level 2 functions - Service layers
const dataAcquisitionLayer = wrappedSpan(
  'dataAcquisitionLayer',
  async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const primaryData = await primaryDataSources(userId);
    return primaryData;
  },
  { layer: 'data-acquisition' }
);

// Level 1 function - Main orchestration
const orchestrationLayer = wrappedSpan(
  'orchestrationLayer',
  async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const dataLayer = await dataAcquisitionLayer(userId);
    const processingResult = await processingLayer(dataLayer);
    const analyticsResult = await analyticsLayer();
    
    return {
      data: processingResult,
      analytics: analyticsResult,
      orchestrationComplete: true
    };
  },
  { layer: 'orchestration' }
);

// Main workflow function - Level 0
const deeplyNestedWorkflow = wrappedSpan(
  'deeplyNestedWorkflow',
  async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const orchestrationResult = await orchestrationLayer(userId);
    
    return {
      ...orchestrationResult,
      workflowType: 'deeply-nested',
      totalLayers: 6,
      completedAt: new Date().toISOString()
    };
  },
  (userId) => ({ workflowId: `deeply-nested-${userId}`, type: 'deeply-nested-processing', maxDepth: 6 })
);

const getUserWorkflow = quickUserWorkflow; // Default to quick workflow

function App() {
  const [count, setCount] = useState(0)
  const [userResult, setUserResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentWorkflow, setCurrentWorkflow] = useState<string>('quick')

  // Example function to test different tracing workflows
  const handleTracedOperation = async (workflowType: string) => {
    const userId = count.toString();
    
    logger.info('🎯 User initiated workflow execution', { 
      workflowType, 
      userId, 
      timestamp: new Date().toISOString(),
      userAction: 'button_click'
    });
    
    setIsLoading(true);
    setError(null);
    setUserResult(null);
    setCurrentWorkflow(workflowType);
    
    const startTime = Date.now();
    
    try {
      let result;
      
      switch (workflowType) {
        case 'quick':
          result = await quickUserWorkflow(userId);
          break;
        case 'standard':
          result = await standardUserWorkflow(userId);
          break;
        case 'comprehensive':
          result = await comprehensiveUserWorkflow(userId);
          break;
        case 'deeply-nested':
          result = await deeplyNestedWorkflow(userId);
          break;
        default:
          logger.warn('⚠️ Unknown workflow type, falling back to quick', { workflowType, userId });
          result = await quickUserWorkflow(userId);
      }
      
      const duration = Date.now() - startTime;
      
      logger.info('🎉 Workflow execution completed successfully', { 
        workflowType, 
        userId, 
        duration: `${duration}ms`,
        resultKeys: Object.keys(result || {})
      });
      
      setUserResult(result);
      
      // Manually flush traces to see them immediately
      // await flushTraces();
    } catch (err) {
      const duration = Date.now() - startTime;
      const errorMessage = (err as Error).message;
      
      logger.error('💥 Workflow execution failed', { 
        workflowType, 
        userId, 
        duration: `${duration}ms`,
        error: errorMessage,
        stack: (err as Error).stack
      });
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-flush traces periodically
  useEffect(() => {
    const interval = setInterval(() => {
      flushTraces();
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + One Logger Tracing</h1>
      
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      
      <div className="card">
        <h2>🔍 Tracing & Logging Demo - Multiple Scenarios</h2>
        <p>Choose a workflow to test different execution patterns, trace durations, and logging levels:</p>
        
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6', 
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          <strong>📝 Logging Features:</strong>
          <ul style={{ textAlign: 'left', marginTop: '5px', marginBottom: '0' }}>
            <li><strong>Info logs:</strong> Workflow progress and successful operations</li>
            <li><strong>Warning logs:</strong> Long-running operations and fallback scenarios</li>
            <li><strong>Error logs:</strong> Validation failures and exceptions</li>
            <li><strong>Debug logs:</strong> Detailed timing and metadata information</li>
          </ul>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => handleTracedOperation('quick')}
            disabled={isLoading}
            style={{ 
              backgroundColor: isLoading ? '#ccc' : '#22c55e',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              textAlign: 'left'
            }}
          >
            <strong>⚡ Quick Workflow</strong> (~200-500ms)<br/>
            <small>Basic fetch → validate → cache</small>
          </button>
          
          <button 
            onClick={() => handleTracedOperation('standard')}
            disabled={isLoading}
            style={{ 
              backgroundColor: isLoading ? '#ccc' : '#3b82f6',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              textAlign: 'left'
            }}
          >
            <strong>🔄 Standard Workflow</strong> (~500-1200ms)<br/>
            <small>Fetch → process → validate → enrich → cache</small>
          </button>
          
          <button 
            onClick={() => handleTracedOperation('comprehensive')}
            disabled={isLoading}
            style={{ 
              backgroundColor: isLoading ? '#ccc' : '#dc2626',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              textAlign: 'left'
            }}
          >
            <strong>🚀 Comprehensive Workflow</strong> (~2000-4000ms)<br/>
            <small>Parallel fetch + profile → process → validate → enrich → analytics + cache</small>
          </button>
          
          <button 
            onClick={() => handleTracedOperation('deeply-nested')}
            disabled={isLoading}
            style={{ 
              backgroundColor: isLoading ? '#ccc' : '#7c3aed',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              textAlign: 'left'
            }}
          >
            <strong>🏗️ Deeply Nested Workflow</strong> (~1500-3000ms)<br/>
            <small>6-level deep span hierarchy: orchestration → data → processing → ML → analytics</small>
          </button>
        </div>
        
        {isLoading && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f0f9ff', 
            border: '1px solid #0ea5e9', 
            borderRadius: '5px',
            marginBottom: '10px'
          }}>
            🔄 Running <strong>{currentWorkflow}</strong> workflow for User {count}...
          </div>
        )}
        
        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            ❌ Error: {error}
          </div>
        )}
        
        {userResult && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
            ✅ <strong>Result:</strong>
            <pre style={{ fontSize: '12px', marginTop: '5px' }}>
              {JSON.stringify(userResult, null, 2)}
            </pre>
          </div>
        )}
        
        <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
          📝 <strong>Instructions:</strong>
          <ul style={{ textAlign: 'left', marginTop: '5px' }}>
            <li>Open your browser's developer console to see both logs and traces</li>
            <li>Try different workflows to see varying execution times, trace patterns, and log levels</li>
            <li><strong>Quick:</strong> Simple operations with fast execution (info logs)</li>
            <li><strong>Standard:</strong> Medium complexity with data enrichment (info + debug logs)</li>
            <li><strong>Comprehensive:</strong> Complex workflow with parallel operations and analytics (warning logs for heavy operations)</li>
            <li><strong>Deeply Nested:</strong> 6-level deep span hierarchy with detailed logging at each level</li>
            <li>Watch the console for:</li>
            <ul>
              <li>📊 <strong>Structured logs</strong> with metadata and context</li>
              <li>🔗 <strong>Trace hierarchy</strong> showing span relationships</li>
              <li>⏱️ <strong>Performance data</strong> and duration tracking</li>
              <li>🚨 <strong>Error handling</strong> with detailed error logs</li>
            </ul>
            <li>Change the count value to test with different user IDs</li>
            <li>Notice how logs provide context while traces show execution flow</li>
          </ul>
        </div>
      </div>
      
      <p className="read-the-docs">
        Check the browser console to see the tracing output!
      </p>
    </>
  )
}

export default App
