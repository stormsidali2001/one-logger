import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { initializeOneLogger, wrappedSpan, flushTraces } from '@one-logger/client-sdk'


console.log("hello")
// Initialize One Logger with tracing
initializeOneLogger({
  name: 'vite-example-app',
  description: 'Example Vite React app with One Logger tracing',
  isDev: true, // Use console transport for development
  tracer: {
    batchSize: 1, // Flush traces immediately for demo
    flushInterval: 5000, // Flush every second
    useHttpTransport: true // Use console transport
  }
});

// Example traced functions
const fetchUserData = wrappedSpan(
  'fetchUserData',
  async (userId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`
    };
  },
  (userId) => ({ userId, operation: 'fetch' })
);

const processUserData = wrappedSpan(
  'processUserData',
  async (userData: any) => {
    // Simulate data processing
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      ...userData,
      displayName: userData.name.toUpperCase(),
      processed: true
    };
  },
  { layer: 'business-logic' }
);

const validateUserData = wrappedSpan(
  'validateUserData',
  (userData: any) => {
    // Sync validation
    if (!userData.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    return { ...userData, validated: true };
  },
  { layer: 'validation' }
);

const getUserWorkflow = wrappedSpan(
  'getUserWorkflow',
  async (userId: string) => {
    const userData = await fetchUserData(userId);
    const processedData = await processUserData(userData);
    const validatedData = validateUserData(processedData);
    return validatedData;
  },
  (userId) => ({ workflowId: `workflow-${userId}`, type: 'user-processing' })
);

function App() {
  const [count, setCount] = useState(0)
  const [userResult, setUserResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Example function to test tracing
  const handleTracedOperation = async () => {
    setIsLoading(true);
    setError(null);
    setUserResult(null);
    
    try {
      const result = await getUserWorkflow(count.toString());
      setUserResult(result);
      
      // Manually flush traces to see them immediately
      // await flushTraces();
    } catch (err) {
      setError((err as Error).message);
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
        <h2>🔍 Tracing Demo</h2>
        <p>Click the button below to test nested function tracing:</p>
        <button 
          onClick={handleTracedOperation}
          disabled={isLoading}
          style={{ 
            backgroundColor: isLoading ? '#ccc' : '#646cff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Processing...' : `Run Traced Workflow (User ${count})`}
        </button>
        
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
            <li>Open your browser's developer console</li>
            <li>Click "Run Traced Workflow" to see nested tracing in action</li>
            <li>Watch the console for trace hierarchy and span details</li>
            <li>Try different count values to see different user IDs</li>
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
