# One Logger Tracing Demo

This Vite React application demonstrates the tracing capabilities of the `@one-logger/client-sdk` package.

## Features Demonstrated

- **Nested Function Tracing**: Shows how spans are automatically nested when functions call each other
- **Async Operations**: Demonstrates tracing of asynchronous functions with proper timing
- **Metadata Capture**: Shows both static and dynamic metadata attachment to spans
- **Error Handling**: Demonstrates how errors are captured in traces
- **Console Transport**: Uses console output for development-friendly trace visualization

## How to Run

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open your browser to the displayed URL (usually `http://localhost:5173`)

4. Open the browser's Developer Console (F12)

5. Click the "Run Traced Workflow" button to see tracing in action

## What You'll See

When you click the tracing button, you'll see output in the console like:

```
[DEMO] Trace abc123-def456-ghi789
↳ getUserWorkflow ✓ (320ms) metadata: {"workflowId":"workflow-0","type":"user-processing"}
  ↳ fetchUserData ✓ (201ms) metadata: {"userId":"0","operation":"fetch"}
  ↳ processUserData ✓ (101ms) metadata: {"layer":"business-logic"}
  ↳ validateUserData ✓ (0ms) metadata: {"layer":"validation"}

Detailed Span Information
Span: getUserWorkflow
{
  "id": "span-abc123",
  "duration": "320ms",
  "status": "completed",
  "metadata": {
    "workflowId": "workflow-0",
    "type": "user-processing"
  }
}
```

## Code Structure

The demo includes several traced functions:

- `fetchUserData`: Simulates an API call with async delay
- `processUserData`: Simulates data processing
- `validateUserData`: Performs synchronous validation
- `getUserWorkflow`: Orchestrates the entire workflow

Each function is wrapped with `wrappedSpan()` to enable automatic tracing.

## Configuration

The tracing is configured with:

```typescript
initializeOneLogger({
  name: 'vite-example-app',
  description: 'Example Vite React app with One Logger tracing',
  isDev: true, // Use console transport for development
  tracer: {
    batchSize: 1, // Flush traces immediately for demo
    flushInterval: 1000, // Flush every second
    useHttpTransport: false // Use console transport
  }
});
```

## Try Different Scenarios

1. **Change the count**: Click the counter button to change the user ID in the workflow
2. **Multiple operations**: Click the tracing button multiple times to see different traces
3. **Check timing**: Notice how the duration of each span is measured and displayed
4. **Inspect metadata**: See how different metadata is attached to each span

## Next Steps

To use tracing in your own application:

1. Install the package: `pnpm add @one-logger/client-sdk`
2. Initialize the logger with tracing enabled
3. Wrap your functions with `wrappedSpan()`
4. Configure appropriate transports for your environment

For production use, consider:
- Using `HttpTraceTransport` instead of console
- Adjusting batch size and flush intervals for performance
- Setting up proper error handling and monitoring