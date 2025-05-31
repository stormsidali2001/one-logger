export interface TraceData {
  id: string;
  projectId: string;
  name: string;
  startTime: string;
  endTime?: string;
  duration?: string;
  status: 'running' | 'completed' | 'failed';
  metadata: Record<string, any>;
  createdAt: string;
}

export interface SpanData {
  id: string;
  traceId: string;
  parentSpanId?: string;
  name: string;
  startTime: string;
  endTime?: string;
  duration?: string;
  status: 'running' | 'completed' | 'failed';
  metadata: Record<string, any>;
  createdAt: string;
}

export interface CreateTraceData {
  projectId: string;
  name: string;
  startTime: string;
  metadata?: Record<string, any>;
}

export interface CreateSpanData {
  traceId: string;
  parentSpanId?: string;
  name: string;
  startTime: string;
  metadata?: Record<string, any>;
}

export interface UpdateTraceData {
  endTime?: string;
  duration?: string;
  status?: 'running' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export interface UpdateSpanData {
  endTime?: string;
  duration?: string;
  status?: 'running' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}