export const queryKeys = {
  config: {
    get: (key: string) => ['config', key] as const,
    all: ['config', 'all'] as const,
  },
  projects: {
    all: ['projects', 'all'] as const,
    getById: (id: string) => ['projects', 'getById', id] as const,
  },
  logs: {
    all: ['logs', 'all'] as const,
    getById: (id: string) => ['logs', 'getById', id] as const,
    getByProjectId: (projectId: string) => ['logs', 'getByProjectId', projectId] as const,
  },
}; 