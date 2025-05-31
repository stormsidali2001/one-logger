import type { HttpClient } from '../client.js';
import type { ConfigValue, SetConfigData } from '@one-logger/types';

export class ConfigModule {
  constructor(private client: HttpClient) {}

  /**
   * Get all configuration
   */
  async getAll(): Promise<Record<string, any>> {
    return this.client.get<Record<string, any>>('/api/config');
  }

  /**
   * Get configuration value by key
   */
  async get(key: string): Promise<ConfigValue> {
    return this.client.get<ConfigValue>(`/api/config/${key}`);
  }

  /**
   * Set configuration value
   */
  async set(key: string, value: any): Promise<{ success: boolean }> {
    return this.client.post<{ success: boolean }>(`/api/config/${key}`, { value });
  }
}