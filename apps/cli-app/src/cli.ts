#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import open from 'open';
import { ServerManager } from './server/serverManager.js';
import { MCPServerManager } from './server/mcpServerManager.js';
import { WebServerManager } from './server/webServerManager.js';

const program = new Command();
const serverManager = ServerManager.getInstance();
const mcpServerManager = MCPServerManager.getInstance();
const webServerManager = WebServerManager.getInstance();



program
  .name('one-logger')
  .description('One Logger CLI - A powerful logging solution for developers')
  .version('0.1.0');

// Default action - start everything
program
  .action(async () => {
    await startOneLogger();
  });

// Start command (same as default)
program
  .command('start')
  .description('Start the One Logger application')
  .action(async () => {
    await startOneLogger();
  });

async function startOneLogger() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const options = { port: '8947', webPort: '9284', dev: isDevelopment };
  const spinner = ora('Starting One Logger...').start();
  
  try {
    // Start the main API server
    const apiPort = parseInt(options.port);
    await serverManager.startServer();
    spinner.succeed(`API server started on port ${apiPort}`);
    
    // Start MCP server
    const mcpSpinner = ora('Starting MCP server...').start();
    try {
      await mcpServerManager.startServer();
      mcpSpinner.succeed('MCP server started');
    } catch (error) {
      mcpSpinner.warn('MCP server failed to start (continuing without MCP)');
      console.log(chalk.yellow(`MCP Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
    
    // Handle web server based on environment
    const webPort = parseInt(options.webPort);
    let webUrl = '';
    
    if (isDevelopment) {
      // In development mode, just open the dev server URL without starting our own web server
      webUrl = `http://localhost:${webPort}`;
      console.log(chalk.blue(`🌐 Web UI (dev mode): ${webUrl}`));
    } else {
      // In production mode, start the bundled web server
      const webSpinner = ora('Starting web server...').start();
      try {
        await webServerManager.startServer(webPort, false);
        webUrl = webServerManager.getServerUrl(webPort);
        webSpinner.succeed(`Web server started on port ${webPort}`);
      } catch (error) {
        webSpinner.warn('Web server failed to start (continuing without web UI)');
        console.log(chalk.yellow(`Web server error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    }
    
    console.log(chalk.green('\n✅ One Logger is running!'));
    if (webUrl) {
      console.log(chalk.blue(`🌐 Web UI: ${webUrl}`));
    }
    console.log(chalk.blue(`📡 API: http://localhost:${apiPort}/api`));
    console.log(chalk.blue(`📚 Docs: http://localhost:${apiPort}/ui`));
    
    // Open web UI automatically
    if (webUrl) {
      const openSpinner = ora('Opening web UI...').start();
      try {
        await open(webUrl);
        openSpinner.succeed('Web UI opened in browser');
      } catch (error) {
        openSpinner.warn('Could not open browser automatically');
      }
    }
    
    console.log(chalk.gray('\nPress Ctrl+C to stop all servers'));
    
  } catch (error) {
    spinner.fail('Failed to start One Logger');
    console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    process.exit(1);
  }
}

// Stop command
program
  .command('stop')
  .description('Stop the One Logger application')
  .action(async () => {
    const spinner = ora('Stopping One Logger...').start();
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    try {
      // Stop web server (only if not in development mode)
      if (!isDevelopment) {
        try {
          await webServerManager.stopServer();
        } catch (error) {
          // Web server might not be running, continue
        }
      }
      
      // Stop MCP server
      try {
        await mcpServerManager.stopServer();
      } catch (error) {
        // MCP server might not be running, continue
      }
      
      // Stop main API server
      await serverManager.stopServer();
      
      spinner.succeed('One Logger stopped successfully');
      console.log(chalk.green('✅ All services stopped'));
    } catch (error) {
      spinner.fail('Failed to stop One Logger');
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Open command - simple version
program
  .command('open')
  .description('Open the web UI in browser')
  .action(async () => {
    const spinner = ora('Opening web UI...').start();
    
    try {
      await open('http://localhost:9284');
      spinner.succeed('Web UI opened: http://localhost:9284');
    } catch (error) {
      spinner.fail('Failed to open web UI');
      console.log(chalk.blue('You can manually open: http://localhost:9284'));
    }
  });



// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n🛑 Shutting down gracefully...'));
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  try {
    // Only stop web server if not in development mode
    if (!isDevelopment) {
      await webServerManager.stopServer();
    }
    await mcpServerManager.stopServer();
    await serverManager.stopServer();
    console.log(chalk.green('✅ Shutdown complete'));
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('❌ Error during shutdown'));
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log(chalk.yellow('\n🛑 Received SIGTERM, shutting down...'));
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  try {
    // Only stop web server if not in development mode
    if (!isDevelopment) {
      await webServerManager.stopServer();
    }
    await mcpServerManager.stopServer();
    await serverManager.stopServer();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
});

// Parse command line arguments
program.parse();