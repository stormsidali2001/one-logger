#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import open from 'open';
import { ServerManager } from './server/serverManager.js';
import { MCPServerManager } from './server/mcpServerManager.js';
import { GetAllConfig } from './use-cases/getAllConfig.js';
import { SetConfig } from './use-cases/setConfig.js';
import { ConfigRepository } from './repositories/configRepository.js';
import { GetConfig } from './use-cases/getConfig.js';

const program = new Command();
const serverManager = ServerManager.getInstance();
const mcpServerManager = MCPServerManager.getInstance();

const configRepository = new ConfigRepository()
const getConfigUseCase = new GetConfig(configRepository)



program
  .name('one-logger')
  .description('One Logger CLI - A powerful logging solution for developers')
  .version('0.1.0');

// Start command
program
  .command('start')
  .description('Start the One Logger application')
  .option('-p, --port <port>', 'Port to run the server on', '3001')
  .option('-s, --server-only', 'Start only the server without opening the web UI')
  .option('--no-mcp', 'Start without MCP server')
  .action(async (options) => {
    const spinner = ora('Starting One Logger...').start();
    
    try {
      // Start the main server
      let port = 0; 
      const configPort = getConfigUseCase.execute('server.port');
      if(!configPort )
      {
         port = parseInt(configPort);
      }else{

       port = parseInt(options.port);
      }
      await serverManager.startServer();
      spinner.succeed(`Server started on port ${port}`);
      
      
      // Start MCP server if not disabled
      if (options.mcp !== false) {
        const mcpSpinner = ora('Starting MCP server...').start();
        try {
          await mcpServerManager.startServer();
          mcpSpinner.succeed('MCP server started');
        } catch (error) {
          mcpSpinner.warn('MCP server failed to start (continuing without MCP)');
          console.log(chalk.yellow(`MCP Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      }
      
      console.log(chalk.green('\n✅ One Logger is running!'));
      console.log(chalk.blue(`🌐 Web UI: http://localhost:5173`));
      console.log(chalk.blue(`📡 API: http://localhost:${port}/api`));
      console.log(chalk.blue(`📚 Docs: http://localhost:${port}/ui`));
      
      // Open web UI unless server-only mode
      if (!options.serverOnly) {
        const openSpinner = ora('Opening web UI...').start();
        try {
          await open(`http://localhost:5173`);
          openSpinner.succeed('Web UI opened in browser');
        } catch (error) {
          openSpinner.warn('Could not open browser automatically');
        }
      }
      
      console.log(chalk.gray('\nPress Ctrl+C to stop the server'));
      
    } catch (error) {
      spinner.fail('Failed to start One Logger');
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Stop command
program
  .command('stop')
  .description('Stop the One Logger application')
  .action(async () => {
    const spinner = ora('Stopping One Logger...').start();
    
    try {
      // Stop MCP server
      try {
        await mcpServerManager.stopServer();
      } catch (error) {
        // MCP server might not be running, continue
      }
      
      // Stop main server
      await serverManager.stopServer();
      
      spinner.succeed('One Logger stopped successfully');
      console.log(chalk.green('✅ All services stopped'));
    } catch (error) {
      spinner.fail('Failed to stop One Logger');
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Check the status of One Logger services')
  .action(async () => {
    console.log(chalk.blue('🔍 Checking One Logger status...\n'));
    
    // Check main server status
    try {
      // Try to make a request to check if server is running
      const response = await fetch('http://localhost:3000/api/health').catch(() => null);
      const isServerRunning = response?.ok || false;
      console.log(`📡 Main Server: ${isServerRunning ? chalk.green('Running') : chalk.red('Stopped')}`);
      if (isServerRunning) {
        console.log(`   Port: 3000`);
        console.log(`   URL: http://localhost:3000`);
      }
    } catch (error) {
      console.log(`📡 Main Server: ${chalk.red('Stopped')}`);
    }
    
    // Check MCP server status
    try {
      const response = await fetch('http://localhost:3001/health').catch(() => null);
      const isMcpRunning = response?.ok || false;
      console.log(`🔌 MCP Server: ${isMcpRunning ? chalk.green('Running') : chalk.red('Stopped')}`);
      if (isMcpRunning) {
        console.log(`   Port: 3001`);
      }
    } catch (error) {
      console.log(`🔌 MCP Server: ${chalk.red('Stopped')}`);
    }
    
    console.log();
  });

// Open command
program
  .command('open')
  .description('Open the web UI in browser')
  .option('-p, --port <port>', 'Port where the API server is running', '3001')
  .action(async (options) => {
    const apiPort = parseInt(options.port);
    // Check if API server is running
    try {
      const response = await fetch(`http://localhost:${apiPort}/api/health`).catch(() => null);
      if (!response?.ok) {
        console.log(chalk.red('❌ API Server is not running. Start it first with: one-logger start'));
        process.exit(1);
      }
    } catch (error) {
      console.log(chalk.red('❌ API Server is not running. Start it first with: one-logger start'));
      process.exit(1);
    }
    
    const webUIPort = 5173;
    const spinner = ora('Opening web UI...').start();
    
    try {
      await open(`http://localhost:${webUIPort}`);
      spinner.succeed(`Web UI opened: http://localhost:${webUIPort}`);
    } catch (error) {
      spinner.fail('Failed to open web UI');
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      console.log(chalk.blue(`You can manually open: http://localhost:${webUIPort}`));
    }
  });

// Config command group
const configCmd = program
  .command('config')
  .description('Manage One Logger configuration');

configCmd
  .command('get [key]')
  .description('Get configuration value(s)')
  .action(async (key) => {
    try {
      const configRepository = new ConfigRepository();
      const getAllConfigUseCase = new GetAllConfig(configRepository);
      
      if (key) {
        const config = await getAllConfigUseCase.execute();
        const value = config.find(c => c.key === key);
        if (value) {
          console.log(`${key}: ${value.value}`);
        } else {
          console.log(chalk.yellow(`Configuration key '${key}' not found`));
        }
      } else {
        const configs = await getAllConfigUseCase.execute();
        if (configs.length === 0) {
          console.log(chalk.gray('No configuration found'));
        } else {
          console.log(chalk.blue('Configuration:'));
          configs.forEach((config: { key: string; value: string }) => {
            console.log(`  ${config.key}: ${config.value}`);
          });
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

configCmd
  .command('set <key> <value>')
  .description('Set configuration value')
  .action(async (key, value) => {
    try {
      const configRepository = new ConfigRepository();
      const setConfigUseCase = new SetConfig(configRepository);
      await setConfigUseCase.execute(key, value);
      console.log(chalk.green(`✅ Configuration set: ${key} = ${value}`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n🛑 Shutting down gracefully...'));
  
  try {
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
  
  try {
    await mcpServerManager.stopServer();
    await serverManager.stopServer();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
});

// Parse command line arguments
program.parse();