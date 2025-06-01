import type { Log, LogMetadata, LogCreateData, LogCursor, LogPaginationParams } from '@notjustcoders/types';
import type { HttpClient } from '../client.js';

export class LogsModule {
  constructor(private client: HttpClient) {}

  /**
   * Create a new log entry
   */
  async create(data: LogCreateData): Promise<Log> {
    return this.client.post<Log>('/api/logs', data);
  }

  /**
   * Get all logs with pagination
   */
  async getAll(params?: LogPaginationParams): Promise<Log[]> {
    const queryParams: Record<string, any> = {};
    
    if (params) {
      if (params.limit) queryParams.limit = params.limit;
      if (params.cursor) queryParams.cursor = JSON.stringify(params.cursor);
      if (params.sortDirection) queryParams.sortDirection = params.sortDirection;
    }

    return this.client.get<Log[]>('/api/logs', queryParams);
  }

  /**
   * Get log by ID
   */
  async getById(id: string): Promise<Log> {
    return this.client.get<Log>(`/api/logs/${id}`);
  }
}