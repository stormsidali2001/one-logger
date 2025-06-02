# One Logger CLI (`@notjustcoders/one-logger-cli`)

One Logger CLI is a powerful solution for developers that runs locally to collect, view, and manage logs and traces from all their applications in a single, centralized web interface. It stores your data on your machine and provides an easy way to get started with structured logging and tracing.

## Features

- **Centralized Logging:** Collect logs from multiple applications and projects in one place.
- **Web UI:** A user-friendly web interface (accessible at `http://localhost:5173` by default) to view, filter, and search logs and traces.
- **Local Data Storage:** All data is stored locally in an SQLite database (`~/.one-logger/database/projects-database`), giving you full control over your information.
- **API & MCP Servers:** Includes a main API server (default `http://localhost:3001`) for log ingestion and an MCP (Model Context Protocol) server for use in MCP clients like Cursor.
- **Easy Integration:** Works seamlessly with the `@notjustcoders/one-logger-client-sdk` for sending logs from your Node.js or browser applications.
- **Developer Focused:** Designed to simplify the logging and debugging workflow for developers.

## Installation

To use One Logger CLI, you'll typically install it globally using pnpm (or npm/yarn):

```sh
pnpm add -g @notjustcoders/one-logger-cli
```

Alternatively, you can run it directly using `npx` (though global installation is recommended for regular use):

```sh
npx --yes @notjustcoders/one-logger-cli start
```

## Getting Started

1.  **Start the One Logger CLI:**

    Open your terminal and run:

    ```sh
    one-logger start
    ```

    Or simply:

    ```sh
    one-logger
    ```

    This command will:
    *   Start the API server (default: `http://localhost:3001`).
    *   Start the MCP server.
    *   Start the Web UI server (default: `http://localhost:5173`).
    *   Automatically open the Web UI in your default browser.

2.  **Access the Web UI:**

    If it doesn't open automatically, navigate to `http://localhost:5173` in your web browser.
    Here, you'll be able to see logs and traces once your applications start sending them.

## Integrating with Your Applications

To send logs and traces from your applications to the One Logger CLI, you'll use the `@notjustcoders/one-logger-client-sdk` package.

1.  **Install the Client SDK in your project:**

    ```sh
    pnpm add @notjustcoders/one-logger-client-sdk
    ```

2.  **Initialize the Logger:**

    In your application's entry point (e.g., `index.ts`, `main.js`, `app.js`), initialize the logger. Crucially, you need to configure it to send logs to your local One Logger CLI instance.

    ```typescript
    import { initializeOneLogger, logger, HttpTransport } from '@notjustcoders/one-logger-client-sdk';

    // Initialize the logger once at app startup
    initializeOneLogger({
      name: 'your-app-name', // A unique name for your project/application
      description: 'Your application description',
      // For sending logs to the local One Logger CLI:
      transport: new HttpTransport({ 
        url: 'http://localhost:3001/api/logs' // Default API endpoint of One Logger CLI
      }),
      // Configure tracer to send data to the CLI as well
      tracer: {
        batchSize: 5,
        flushInterval: 10000, // 10 seconds
        // Ensure useHttpTransport (or a similar option based on your SDK version) 
        // is set to true if you want traces to be sent over the network.
        // If your SDK version uses the main transport for traces by default when 
        // a specific trace transport isn't configured, the above `HttpTransport` 
        // will be used for traces too.
        useHttpTransport: true 
      }
    });

    // Now you can use the logger and tracing capabilities anywhere in your application
    logger.info('Application started successfully!', { environment: 'production' });
    logger.error('Something went wrong during startup.', { errorCode: 'INIT_FAILURE' });

    // Example of using wrappedSpan for tracing an async function
    const fetchData = wrappedSpan(
      'fetchExternalData',
      async (itemId: string) => {
        logger.info('Fetching item data', { itemId });
        // Simulate an API call
        await new Promise(resolve => setTimeout(resolve, 150));
        return { id: itemId, data: 'some data' };
      },
      (itemId) => ({ itemId, operation: 'network-request' }) // Metadata for the span
    );

    fetchData('item-123');
    ```

    **Note:** The `HttpTransport` configuration ensures that both logs and traces (if `useHttpTransport` is true in tracer config or if traces use the main transport) are sent to the One Logger CLI running at `http://localhost:3001/api/logs`. Adjust the URL if your CLI runs on a different port.

3.  **Using Logging and Tracing Features:**

    The `@notjustcoders/one-logger-client-sdk` provides several key exports for logging and tracing:

    *   `logger`: For sending structured logs (e.g., `logger.info()`, `logger.warn()`, `logger.error()`).
    *   `wrappedSpan`: A higher-order function to easily wrap asynchronous functions for tracing. It automatically creates spans, measures execution time, and captures metadata.
    *   `wrappedObject`: A utility to wrap all methods of an object or class, automatically creating spans for each method call.

    For comprehensive examples on how to use these features, including sending logs with different levels, adding custom metadata, and advanced tracing scenarios, please refer to the detailed `@notjustcoders/one-logger-client-sdk` [README](https://github.com/stormsidali2001/one-logger/blob/main/packages/logger/README.md).

## Using the Web UI

Once your applications are configured to send logs to the One Logger CLI, you can:

-   **View Logs:** See a real-time stream of logs from all connected applications.
-   **Filter and Search:** Easily find specific logs using powerful filtering and search capabilities.
-   **Inspect Traces:** Visualize call stacks and performance data for traced operations.
-   **Manage Projects:** (If applicable) See logs organized by the `projectId` or `name` you configured in the client SDK.

This centralized UI helps you monitor the health and behavior of all your projects from a single dashboard.

## Data Storage

One Logger CLI stores all your log and trace data locally in an SQLite database. 

-   **Default Database Path:** `~/.one-logger/database/projects-database`
    (`~` refers to your user's home directory).

This ensures your data remains on your machine and under your control.

## CLI Commands

-   `one-logger` or `one-logger start`:
    Starts all One Logger services (API, MCP, Web UI) and opens the UI.

-   `one-logger stop`:
    Stops all running One Logger services gracefully.

-   `one-logger open`:
    Opens the Web UI (`http://localhost:5173`) in your default browser.

-   `one-logger --help`:
    Displays help information and all available commands and options.

## Development (for contributors)

If you want to contribute to the One Logger CLI itself:

1.  Clone the repository.
2.  Navigate to the `apps/cli-app` directory.
3.  Install dependencies: `pnpm install`
4.  Run in development mode: `pnpm dev`
    This will start the CLI with hot-reloading for the `src/cli.ts` file.

## Repository

-   **GitHub**: [https://github.com/stormsidali2001/one-logger](https://github.com/stormsidali2001/one-logger) (Main monorepo)
-   **Issues**: [https://github.com/stormsidali2001/one-logger/issues](https://github.com/stormsidali2001/one-logger/issues)

## License

MIT