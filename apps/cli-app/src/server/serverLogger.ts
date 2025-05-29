/**
 * Custom console logger that captures logs for servers
 */
export class ServerLogger {
  private original: typeof console;
  private logs = {
    stdout: [] as string[],
    stderr: [] as string[],
    maxLogLines: 1000, // Maximum number of log lines to keep
  };
  
  constructor(private logPrefix: string = '') {
    this.original = { ...console };
  }
  
  log(...args: any[]) {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    const prefixedMessage = this.logPrefix ? `[${this.logPrefix}] ${message}` : message;
    this.logs.stdout.push(`[${new Date().toISOString()}] ${prefixedMessage}`);
    
    // Trim if exceeds max lines
    if (this.logs.stdout.length > this.logs.maxLogLines) {
      this.logs.stdout = this.logs.stdout.slice(-this.logs.maxLogLines);
    }
    
    // Call original console.log
    this.original.log(prefixedMessage);
  }
  
  error(...args: any[]) {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    const prefixedMessage = this.logPrefix ? `[${this.logPrefix}] ${message}` : message;
    this.logs.stderr.push(`[${new Date().toISOString()}] ${prefixedMessage}`);
    
    // Trim if exceeds max lines
    if (this.logs.stderr.length > this.logs.maxLogLines) {
      this.logs.stderr = this.logs.stderr.slice(-this.logs.maxLogLines);
    }
    
    // Call original console.error
    this.original.error(prefixedMessage);
  }
  
  // Get logs by type
  getLogs(type: 'stdout' | 'stderr' | 'all') {
    if (type === 'stdout') return this.logs.stdout;
    if (type === 'stderr') return this.logs.stderr;
    return {
      stdout: this.logs.stdout,
      stderr: this.logs.stderr
    };
  }
  
  // Clear logs by type
  clearLogs(type: 'stdout' | 'stderr' | 'all'): boolean {
    if (type === 'stdout' || type === 'all') this.logs.stdout = [];
    if (type === 'stderr' || type === 'all') this.logs.stderr = [];
    return true;
  }
} 