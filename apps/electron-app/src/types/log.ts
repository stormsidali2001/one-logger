export interface Log {
  id: string;
  projectId: string;
  level: string;
  message: string;
  timestamp: string; // ISO date string
  meta: Record<string, unknown>;
} 