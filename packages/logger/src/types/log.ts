export type LogLevel = 'log' | 'info' | 'warn' | 'error';

export interface Log {
  id: string;
  projectId: string;
  level: string;
  message: string;
  timestamp: string;
  meta: Record<string, unknown>;
}

export interface LogCreate {
  projectId: string;
  level: string;
  message: string;
  timestamp: string;
  meta: Record<string, unknown>;
} 