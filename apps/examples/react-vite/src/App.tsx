import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Logger } from 'logger/src'
import { useLogger } from './hooks/useLogger'

function App() {
  const [count, setCount] = useState(0)
  
  const { logger, loading, error } = useLogger({
    name: 'Vite Example Project',
    description: 'Example project demonstrating the one-logger library in a Vite app',
    endpoint: 'http://127.0.0.1:5173'
  });

  // Function to demonstrate logging different levels
  const handleLogButtonClick = async (level: 'info' | 'warn' | 'error' | 'log') => {
    if (!logger) return
    
    try {
      const message = `User clicked the ${level} log button (count: ${count})`
      const metadata = {
        count,
        buttonType: level,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }
      
      await logger[level](message, metadata)
      console.log(`${level} log sent successfully`)
    } catch (err) {
      console.error(`Failed to send ${level} log:`, err)
    }
  }

  // Function to deliberately trigger an error for logging
  const simulateError = async () => {
    if (!logger) return
    
    try {
      // Deliberately cause an error
      throw new Error('This is a simulated error with a stack trace')
    } catch (err) {
      const error = err as Error
      
      // Log the error with the stack trace
      await logger.error('Simulated error occurred', {
        errorMessage: error.message,
        stack: error.stack,
        count,
        timestamp: new Date().toISOString(),
      })
      
      console.log('Error log with stack trace sent successfully')
    }
  }

  // Function to log with complex metadata
  const logWithComplexData = async () => {
    if (!logger) return
    
    const complexData = {
      nestedObject: {
        level1: {
          level2: {
            level3: 'Deeply nested value',
            array: [1, 2, 3, 4, 5],
          },
          boolean: true,
        },
      },
      longText: 'This is a very long text that will test how the UI handles long strings in metadata. '.repeat(10),
      currentState: { count },
      randomData: Array.from({ length: 5 }, (_, i) => ({
        id: i,
        value: Math.random().toString(36).substring(2),
      })),
    }
    
    await logger.info('Log with complex nested data', complexData)
    console.log('Complex data log sent successfully')
  }

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
      <h1>One-Logger Demo</h1>
      
      {loading ? (
        <p>Initializing logger...</p>
      ) : error ? (
        <div className="error-container">
          <p>Error initializing logger: {error}</p>
          <p>Please ensure the Electron app is running</p>
        </div>
      ) : (
        <div className="card">
          <h2>Logger Status: {logger ? 'Ready' : 'Not Initialized'}</h2>
          
          <div className="counter">
            <p>Counter: {count}</p>
            <button onClick={() => setCount((count) => count + 1)}>
              Increment
            </button>
          </div>
          
          <div className="log-buttons">
            <h3>Log Examples</h3>
            <div className="button-row">
              <button 
                className="info-button" 
                onClick={() => handleLogButtonClick('info')}
              >
                Info Log
              </button>
              <button 
                className="warn-button" 
                onClick={() => handleLogButtonClick('warn')}
              >
                Warning Log
              </button>
              <button 
                className="error-button" 
                onClick={() => handleLogButtonClick('error')}
              >
                Error Log
              </button>
            </div>
            
            <h3>Special Examples</h3>
            <div className="button-row">
              <button 
                className="stack-button" 
                onClick={simulateError}
              >
                Log with Stack Trace
              </button>
              <button 
                className="complex-button" 
                onClick={logWithComplexData}
              >
                Log Complex Data
              </button>
            </div>
          </div>
          
          <p className="instructions">
            Click the buttons above to send different types of logs.<br />
            Check the Electron app to see your logs appear in real-time.
          </p>
        </div>
      )}
      
      <p className="read-the-docs">
        One-Logger: A simple, efficient logging solution
      </p>
    </>
  )
}

export default App
