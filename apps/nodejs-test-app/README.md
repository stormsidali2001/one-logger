# Node.js Test App for One Logger

This is a comprehensive test application for the One Logger package in a Node.js environment. It demonstrates all the key features including logging, tracing, and the new context adapter functionality.

## Features Tested

### 1. Basic Logging
- Info, debug, warn, and error logging
- Structured logging with metadata
- Different log levels

### 2. Wrapped Span Functionality
- Simple async operations with automatic span creation
- Nested operations with proper span hierarchy
- Automatic error handling and span finishing

### 3. Wrapped Object
- Automatic tracing of all methods in an object
- Async and sync method support
- Method-level span creation

### 4. Wrapped Class
- Constructor and method tracing
- Instance-based tracing
- Class-level span metadata

### 5. Context Propagation (Node.js Specific)
- Tests the new context adapter system
- Automatic async context propagation using Node.js `AsyncLocalStorage`
- Parallel operations with proper context isolation
- Verification of current span context

### 6. Manual Span Creation
- Manual span creation and management
- `runWithContext` method for proper async context
- Context verification and validation

### 7. Error Handling
- Error tracing and logging
- Automatic span error marking
- Stack trace capture

## Prerequisites

1. **One Logger CLI**: Make sure the One Logger CLI is running:
   ```bash
   cd ../cli-app
   pnpm dev
   ```
   The CLI should be running on `http://localhost:3001`

2. **Dependencies**: Install dependencies from the workspace root:
   ```bash
   cd ../../
   pnpm install
   ```

## Running the Tests

### Development Mode (with hot reload)
```bash
pnpm dev
```

### Build and Run
```bash
pnpm build
pnpm start
```

### Quick Test
```bash
pnpm test
```

## What to Expect

When you run the test app, you should see:

1. **Console Output**: Detailed logging output showing all test operations
2. **CLI Dashboard**: If the One Logger CLI is running, you can view the logs and traces at `http://localhost:3001`
3. **Context Propagation**: In Node.js, you should see proper async context propagation working automatically

## Key Differences from Browser Environment

### Context Adapter Benefits
This Node.js test app specifically demonstrates the benefits of the new context adapter system:

- **Automatic Context Propagation**: Unlike browser environments, Node.js automatically maintains span context across async operations
- **No Manual Context Management**: You don't need to manually pass context or use callbacks
- **Promise.all Support**: Parallel operations maintain their individual contexts
- **AsyncLocalStorage**: Uses Node.js native `AsyncLocalStorage` for optimal performance

### Browser Fallback
The same code will work in browsers but will fall back to the stack-based approach for context management.

## Configuration

The app is configured to:
- Send logs and traces to the One Logger CLI at `http://localhost:3001/api/logs`
- Use batch processing for optimal performance
- Enable debug-level logging for comprehensive output
- Use HTTP transport for both logs and traces

## Troubleshooting

### CLI Not Running
If you see connection errors, make sure the One Logger CLI is running:
```bash
cd ../cli-app
pnpm dev
```

### Port Conflicts
If port 3001 is in use, you can modify the transport URL in `src/index.ts`:
```typescript
transport: {
  type: 'http',
  url: 'http://localhost:YOUR_PORT/api/logs',
  // ...
}
```

### Context Issues
If you notice context propagation issues:
1. Verify you're running in Node.js (not browser)
2. Check that the context adapter is properly initialized
3. Look for "Using runWithContext" messages in the output

## Expected Output

You should see output similar to:
```
🚀 Starting Node.js logger test
📝 Test 1: Basic Logging
🔄 Test 2: Simple Wrapped Span
🏗️ Test 3: Nested Operations
📦 Test 4: Wrapped Object
🏭 Test 5: Wrapped Class
🧪 Test 6: Context Propagation
✨ Using runWithContext for proper async context
🔧 Test 7: Manual Spans
💥 Test 8: Error Handling
🎉 All tests completed successfully!
```

The presence of "Using runWithContext" indicates that the Node.js context adapter is working correctly.