import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { flushTraces, logger } from '@notjustcoders/one-logger-client-sdk'
import './config/logger' // Initialize logger
import { quickUserWorkflow, standardUserWorkflow, comprehensiveUserWorkflow, errorProneWorkflow } from './workflows/userWorkflows'
import { deeplyNestedWorkflow } from './workflows/deeplyNestedWorkflow'
import { demonstrateWrappedObject } from './services/UserService'
import { useUserRepository } from './hooks/useUserRepository'

console.log("hello")

function App() {
  const [count, setCount] = useState(0)
  const [userResult, setUserResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentWorkflow, setCurrentWorkflow] = useState<string>('quick')
  
  // Initialize the user repository hook
  const userRepository = useUserRepository()

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
        case 'wrapped-object':
          result = await demonstrateWrappedObject();
          break;
        case 'error-prone':
          result = await errorProneWorkflow(userId);
          break;
        case 'repository':
          result = await userRepository.processUserWorkflow(userId);
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
      <h1>One Logger Tracing Demo</h1>
      
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        
        <div style={{ marginTop: '20px' }}>
          <h3>🔍 Tracing & Logging Demo</h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            One Logger provides comprehensive logging with structured data and distributed tracing capabilities.
            Each workflow demonstrates different complexity levels and tracing patterns:
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
          <button 
            onClick={() => handleTracedOperation('quick')}
            disabled={isLoading}
            style={{ 
              backgroundColor: isLoading ? '#ccc' : '#10b981',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              textAlign: 'left'
            }}
          >
            <strong>⚡ Quick Workflow</strong> (~800-1800ms)<br/>
            <small>Simple: fetch → validate → cache (3 spans, basic logging)</small>
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
            <strong>🔄 Standard Workflow</strong> (~1500-3500ms)<br/>
            <small>Medium: fetch → process → validate → enrich → cache (5 spans)</small>
          </button>
          
          <button 
            onClick={() => handleTracedOperation('comprehensive')}
            disabled={isLoading}
            style={{ 
              backgroundColor: isLoading ? '#ccc' : '#ef4444',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              textAlign: 'left'
            }}
          >
            <strong>🚀 Comprehensive Workflow</strong> (~3000-7000ms)<br/>
            <small>Complex: parallel fetching + heavy analytics + enrichment (7+ spans)</small>
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
          
          <button 
            onClick={() => handleTracedOperation('wrapped-object')}
            disabled={isLoading}
            style={{ 
              backgroundColor: isLoading ? '#ccc' : '#f59e0b',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              textAlign: 'left'
            }}
          >
            <strong>🎭 Wrapped Object Demo</strong> (~300-800ms)<br/>
            <small>UserService class with all methods automatically traced via wrappedObject</small>
          </button>
          
          <button 
            onClick={() => handleTracedOperation('error-prone')}
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
            <strong>💥 Error-Prone Workflow</strong> (~500-1000ms)<br/>
            <small>3-level nested workflow with intentional error at level 3 for error tracing demo</small>
          </button>
          
          <button 
            onClick={() => handleTracedOperation('repository')}
            disabled={isLoading}
            style={{ 
              backgroundColor: isLoading ? '#ccc' : '#059669',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              textAlign: 'left'
            }}
          >
            <strong>🏛️ Repository Hook Workflow</strong> (~700-1200ms)<br/>
            <small>React hook with repository pattern: fetch → enrich → cache (3 sequential methods)</small>
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
            <li><strong>Error-Prone:</strong> 3-level nested workflow that demonstrates error tracing and span error handling</li>
            <li><strong>Repository Hook:</strong> React hook pattern with repository object wrapping - sequential method calls (fetch → enrich → cache)</li>
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
