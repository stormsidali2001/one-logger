export const queryKeys = {
  config: {
    all: ['config'] as const,
    value: (key: string) => [...queryKeys.config.all, 'value', key] as const,
  },
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.projects.lists(), { filters }] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
    metrics: (id: string) => [...queryKeys.projects.all, 'metrics', id] as const,
    config: (id: string) => [...queryKeys.projects.all, 'config', id] as const,
  },
  logs: {
    all: ['logs'] as const,
    lists: () => [...queryKeys.logs.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.logs.lists(), { filters }] as const,
    details: () => [...queryKeys.logs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.logs.details(), id] as const,
    byProject: (projectId: string) => [...queryKeys.logs.all, 'byProject', projectId] as const,
    historicalCounts: (projectId: string, days: number) => [
      ...queryKeys.logs.all,
      'historicalCounts',
      projectId,
      days,
    ] as const,
  },
  server: {
    all: ['server'] as const,
    logs: (type?: string) => [...queryKeys.server.all, 'logs', type || 'all'] as const,
    mcpLogs: (type?: string) => [...queryKeys.server.all, 'mcpLogs', type || 'all'] as const,
  },
  metadata: {
    all: ['metadata'] as const,
    keys: () => [...queryKeys.metadata.all, 'keys'] as const,
  },
};