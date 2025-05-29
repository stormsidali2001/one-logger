import { ChildProcess } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

export interface ManagedProcess {
  name: string;
  process: ChildProcess;
  pid?: number;
  killed: boolean;
}

export class ProcessManager {
  private processes: Map<string, ManagedProcess> = new Map();

  /**
   * Add a process to be managed
   */
  addProcess(name: string, process: ChildProcess): void {
    const managedProcess: ManagedProcess = {
      name,
      process,
      pid: process.pid,
      killed: false
    };

    this.processes.set(name, managedProcess);

    // Listen for process exit
    process.on('exit', () => {
      managedProcess.killed = true;
    });
  }

  /**
   * Get a managed process by name
   */
  getProcess(name: string): ManagedProcess | undefined {
    return this.processes.get(name);
  }

  /**
   * Get list of all managed processes
   */
  getProcessList(): ManagedProcess[] {
    return Array.from(this.processes.values());
  }

  /**
   * Kill a specific process by name
   */
  async killProcess(name: string): Promise<void> {
    const managedProcess = this.processes.get(name);
    if (!managedProcess || managedProcess.killed) {
      return;
    }

    try {
      // Try graceful shutdown first
      managedProcess.process.kill('SIGTERM');
      
      // Wait a bit for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Force kill if still running
      if (!managedProcess.killed && managedProcess.pid) {
        try {
          process.kill(managedProcess.pid, 'SIGKILL');
        } catch (error) {
          // Process might already be dead
        }
      }
      
      managedProcess.killed = true;
    } catch (error) {
      // Process might already be dead
      managedProcess.killed = true;
    }
  }

  /**
   * Kill all managed processes
   */
  async killAll(): Promise<void> {
    const killPromises = Array.from(this.processes.keys()).map(name => 
      this.killProcess(name)
    );
    
    await Promise.all(killPromises);
    this.processes.clear();
  }

  /**
   * Check if a port is in use
   */
  async isPortInUse(port: number): Promise<boolean> {
    try {
      // Use lsof to check if port is in use (macOS/Linux)
      const { stdout } = await execAsync(`lsof -i :${port}`);
      return stdout.trim().length > 0;
    } catch (error) {
      // If lsof fails or returns no results, port is not in use
      return false;
    }
  }

  /**
   * Find process using a specific port
   */
  async findProcessOnPort(port: number): Promise<string | null> {
    try {
      const { stdout } = await execAsync(`lsof -ti :${port}`);
      const pid = stdout.trim();
      if (pid) {
        const { stdout: processInfo } = await execAsync(`ps -p ${pid} -o comm=`);
        return processInfo.trim();
      }
    } catch (error) {
      // Process not found or error occurred
    }
    return null;
  }

  /**
   * Kill process on specific port
   */
  async killProcessOnPort(port: number): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`lsof -ti :${port}`);
      const pid = stdout.trim();
      if (pid) {
        await execAsync(`kill -9 ${pid}`);
        return true;
      }
    } catch (error) {
      // Process not found or error occurred
    }
    return false;
  }
}