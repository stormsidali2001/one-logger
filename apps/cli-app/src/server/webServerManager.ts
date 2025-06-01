import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';
import chalk from 'chalk';
import express from 'express';
import { Server } from 'http';

export class WebServerManager {
  private static instance: WebServerManager;
  private webServerProcess: ChildProcess | null = null;
  private webServer: Server | null = null;
  private isRunning = false;
  private isDevelopment = false;

  private constructor() {}

  static getInstance(): WebServerManager {
    if (!WebServerManager.instance) {
      WebServerManager.instance = new WebServerManager();
    }
    return WebServerManager.instance;
  }

  async startServer(port: number = 5173, development: boolean = false): Promise<void> {
    if (this.isRunning) {
      throw new Error('Web server is already running');
    }

    this.isDevelopment = development;
    const projectRoot = this.getProjectRoot();

    if (development) {
      // In development, run pnpm dev --filter vite-web-server
      return this.startDevelopmentServer(projectRoot, port);
    } else {
      // In production, serve bundled files from CLI's dist/web directory
      return this.startProductionServer(port);
    }
  }

  private async startDevelopmentServer(projectRoot: string, port: number): Promise<void> {
    const viteAppPath = join(projectRoot, 'apps', 'vite-web-server');

    if (!existsSync(viteAppPath)) {
      throw new Error(`Vite web server app not found at: ${viteAppPath}`);
    }

    return new Promise((resolve, reject) => {
      this.webServerProcess = spawn('pnpm', ['dev', '--filter', 'vite-web-server'], {
        cwd: projectRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, PORT: port.toString() }
      });

      this.setupProcessHandlers(resolve, reject);
    });
  }

  private async startProductionServer(port: number): Promise<void> {
    const webDistPath = join(__dirname, '..', 'web');

    if (!existsSync(webDistPath)) {
      throw new Error(`Web app bundle not found at: ${webDistPath}. Please run 'pnpm build' first.`);
    }

    return new Promise((resolve, reject) => {
      try {
        const app = express();
        
        // Serve static files from the bundled web app
        app.use(express.static(webDistPath));
        
        // Handle SPA routing - serve index.html for all routes that don't match static files
        app.get('/*path', (req, res, next) => {
          // Skip if it's a static file request
          if (req.path.includes('.')) {
            return next();
          }
          res.sendFile(join(webDistPath, 'index.html'));
        });

        this.webServer = app.listen(port, () => {
          this.isRunning = true;
          resolve();
        });

        this.webServer.on('error', (error: any) => {
          if (error.code === 'EADDRINUSE') {
            reject(new Error(`Port ${port} is already in use`));
          } else {
            reject(new Error(`Web server failed to start: ${error.message}`));
          }
        });
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Unknown error starting web server'));
      }
    });
  }

  private setupProcessHandlers(resolve: () => void, reject: (error: Error) => void): void {
    if (!this.webServerProcess) {
      reject(new Error('Web server process not initialized'));
      return;
    }

    let resolved = false;

    this.webServerProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      
      // Look for server ready indicators
      if ((output.includes('Local:') || output.includes('ready in') || output.includes('Local server')) && !resolved) {
        this.isRunning = true;
        resolved = true;
        resolve();
      }
    });

    this.webServerProcess.stderr?.on('data', (data) => {
      const error = data.toString();
      console.error(chalk.red(`Web server error: ${error}`));
      
      // Don't reject on warnings, only on actual errors
      if (error.toLowerCase().includes('error') && !error.toLowerCase().includes('warning') && !resolved) {
        resolved = true;
        reject(new Error(`Web server failed to start: ${error}`));
      }
    });

    this.webServerProcess.on('error', (error) => {
      if (!resolved) {
        resolved = true;
        reject(new Error(`Failed to start web server: ${error.message}`));
      }
    });

    this.webServerProcess.on('exit', (code, signal) => {
      this.isRunning = false;
      this.webServerProcess = null;
      
      if (code !== 0 && code !== null && !resolved) {
        resolved = true;
        reject(new Error(`Web server exited with code ${code}`));
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        reject(new Error('Web server startup timeout'));
      }
    }, 30000);
  }

  async stopServer(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    return new Promise((resolve) => {
      if (this.isDevelopment && this.webServerProcess) {
        // Stop Vite development server
        this.webServerProcess.on('exit', () => {
          this.isRunning = false;
          this.webServerProcess = null;
          resolve();
        });

        // Try graceful shutdown first
        this.webServerProcess.kill('SIGTERM');

        // Force kill after 5 seconds if still running
        setTimeout(() => {
          if (this.webServerProcess && !this.webServerProcess.killed) {
            this.webServerProcess.kill('SIGKILL');
          }
        }, 5000);
      } else if (this.webServer) {
        // Stop Express production server
        this.webServer.close(() => {
          this.isRunning = false;
          this.webServer = null;
          resolve();
        });
      } else {
        this.isRunning = false;
        resolve();
      }
    });
  }

  isServerRunning(): boolean {
    return this.isRunning;
  }

  getServerUrl(port: number = 5173): string {
    return `http://localhost:${port}`;
  }

  private getProjectRoot(): string {
    // Navigate up from cli-app/src to the monorepo root
    let currentDir = __dirname;
    
    // Go up until we find package.json with "one-logger" name
    while (currentDir !== '/') {
      const packageJsonPath = join(currentDir, 'package.json');
      if (existsSync(packageJsonPath)) {
        try {
          const packageJson = require(packageJsonPath);
          if (packageJson.name === 'one-logger') {
            return currentDir;
          }
        } catch {
          // Continue searching
        }
      }
      currentDir = join(currentDir, '..');
    }
    
    // Fallback: assume we're in apps/cli-app/src and go up 3 levels
    return join(__dirname, '..', '..', '..');
  }
}