import type { TraceData, SpanData, TraceCreateData, TraceUpdateData, SpanCreateData, SpanUpdateData, TraceWithSpans, TracesOptions } from '@notjustcoders/one-logger-types';
import type { HttpClient } from '../client.js';

export class TracesModule {
  constructor(private client: HttpClient) {}

  /**
   * Create a new trace
   */
  async create(data: TraceCreateData): Promise<TraceData> {
    return this.client.post<TraceData>('/api/traces', data);
  }

  /**
   * Create multiple traces in bulk
   */
  async bulkCreate(traces: TraceCreateData[]): Promise<{ success: boolean; count: number; traces: TraceData[] }> {
    return this.client.post<{ success: boolean; count: number; traces: TraceData[] }>('/api/traces/bulk', { traces });
  }

  /**
   * Get trace by ID
   */
  async getById(id: string): Promise<TraceData> {
    return this.client.get<TraceData>(`/api/traces/${id}`);
  }

  /**
   * Update a trace
   */
  async update(id: string, data: TraceUpdateData): Promise<TraceData> {
    return this.client.put<TraceData>(`/api/traces/${id}`, data);
  }

  /**
   * Get complete trace with all spans
   */
  async getComplete(id: string): Promise<TraceWithSpans> {
    return this.client.get<TraceWithSpans>(`/api/traces/${id}/complete`);
  }

  /**
   * Get traces by project ID
   */
  async getByProjectId(projectId: string, options?: TracesOptions): Promise<{
    traces: TraceData[];
    hasNextPage: boolean;
}> {
    const params: Record<string, any> = {};
    
    if (options) {
      if (options.limit) params.limit = options.limit.toString();

      if (options.sortDirection) params.sortDirection = options.sortDirection;
      if(options.cursor) params.cursor = JSON.stringify(options.cursor);
    }

    return this.client.get<{
    traces: TraceData[];
    hasNextPage: boolean;
}>(`/api/traces/project/${projectId}`, params);
  }

  /**
   * Clear all traces for a project
   */
  async clearByProjectId(projectId: string): Promise<void> {
    return this.client.delete<void>(`/api/traces/project/${projectId}`);
  }

  // Span methods

  /**
   * Create a new span
   */
  async createSpan(data: SpanCreateData): Promise<SpanData> {
    return this.client.post<SpanData>('/api/traces/spans', data);
  }

  /**
   * Get span by ID
   */
  async getSpanById(id: string): Promise<SpanData> {
    return this.client.get<SpanData>(`/api/traces/spans/${id}`);
  }

  /**
   * Update a span
   */
  async updateSpan(id: string, data: SpanUpdateData): Promise<SpanData> {
    return this.client.put<SpanData>(`/api/traces/spans/${id}`, data);
  }

  /**
   * Get spans by trace ID
   */
  async getSpansByTraceId(traceId: string): Promise<SpanData[]> {
    return this.client.get<SpanData[]>(`/api/traces/${traceId}/spans`);
  }
}