import { OpenAPIHono, z } from '@hono/zod-openapi';
import { serve } from '@hono/node-server';
import { swaggerUI } from '@hono/swagger-ui';
import { ProjectRepository } from './db/projectRepository.js';
import { LogRepository } from './db/logRepository.js';

const app = new OpenAPIHono();
const repo = new ProjectRepository();
const logRepo = new LogRepository();

const ProjectSchema = z.object({
  id: z.string().openapi({ example: 'uuid' }),
  name: z.string().openapi({ example: 'My Project' }),
  description: z.string().openapi({ example: 'A project description' }),
  createdAt: z.string().openapi({ example: '2024-05-17T12:00:00Z' }),
}).openapi('Project');

const ProjectCreateSchema = z.object({
  name: z.string().openapi({ example: 'My Project' }),
  description: z.string().openapi({ example: 'A project description' }).optional(),
}).openapi('ProjectCreate');

const ProjectUpdateSchema = z.object({
  name: z.string().optional().openapi({ example: 'Updated Name' }),
  description: z.string().optional().openapi({ example: 'Updated description' }),
}).openapi('ProjectUpdate');

const SuccessSchema = z.object({ success: z.boolean() }).openapi('Success');

const LogSchema = z.object({
  id: z.string().openapi({ example: 'uuid' }),
  projectId: z.string().openapi({ example: 'project-uuid' }),
  level: z.string().openapi({ example: 'info' }),
  message: z.string().openapi({ example: 'A log message' }),
  timestamp: z.string().openapi({ example: '2024-05-17T12:00:00Z' }),
  meta: z.record(z.unknown()).openapi({ example: { foo: 'bar' } }),
}).openapi('Log');

const LogCreateSchema = z.object({
  projectId: z.string().openapi({ example: 'project-uuid' }),
  level: z.string().openapi({ example: 'info' }),
  message: z.string().openapi({ example: 'A log message' }),
  timestamp: z.string().openapi({ example: '2024-05-17T12:00:00Z' }),
  meta: z.record(z.unknown()).openapi({ example: { foo: 'bar' } }),
}).openapi('LogCreate');

// GET /api/projects
app.openapi(
  {
    method: 'get',
    path: '/api/projects',
    responses: {
      200: {
        description: 'List of projects',
        content: { 'application/json': { schema: ProjectSchema.array() } },
      },
    },
    summary: 'Get all projects',
    tags: ['Projects'],
  },
  async (c) => {
    const projects = await repo.getAllProjects();
    return c.json(projects);
  }
);

// GET /api/projects/:id
app.openapi(
  {
    method: 'get',
    path: '/api/projects/{id}',
    request: {
      params: z.object({ id: z.string().openapi({ param: { name: 'id', in: 'path' }, example: 'uuid' }) }),
    },
    responses: {
      200: {
        description: 'Project',
        content: { 'application/json': { schema: ProjectSchema } },
      },
      404: { description: 'Not found' },
    },
    summary: 'Get a project by ID',
    tags: ['Projects'],
  },
  async (c) => {
    const { id } = c.req.valid('param');
    const project = await repo.getProjectById(id);
    if (!project) return c.notFound();
    return c.json(project);
  }
);

// POST /api/projects
app.openapi(
  {
    method: 'post',
    path: '/api/projects',
    request: {
      body: {
        content: {
          'application/json': { schema: ProjectCreateSchema },
        },
      },
    },
    responses: {
      201: {
        description: 'Created project',
        content: { 'application/json': { schema: ProjectSchema } },
      },
      400: { description: 'Missing name' },
    },
    summary: 'Create a new project',
    tags: ['Projects'],
  },
  async (c) => {
    const data = c.req.valid('json');
    const project = await repo.createProject({ name: data.name, description: data.description || '' });
    return c.json(project, 201);
  }
);

// PUT /api/projects/:id
app.openapi(
  {
    method: 'put',
    path: '/api/projects/{id}',
    request: {
      params: z.object({ id: z.string().openapi({ param: { name: 'id', in: 'path' }, example: 'uuid' }) }),
      body: {
        content: {
          'application/json': { schema: ProjectUpdateSchema },
        },
      },
    },
    responses: {
      200: {
        description: 'Updated project',
        content: { 'application/json': { schema: ProjectSchema } },
      },
      404: { description: 'Not found' },
    },
    summary: 'Update a project',
    tags: ['Projects'],
  },
  async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const updated = await repo.updateProject(id, data);
    if (!updated) return c.notFound();
    return c.json(updated);
  }
);

// DELETE /api/projects/:id
app.openapi(
  {
    method: 'delete',
    path: '/api/projects/{id}',
    request: {
      params: z.object({ id: z.string().openapi({ param: { name: 'id', in: 'path' }, example: 'uuid' }) }),
    },
    responses: {
      200: {
        description: 'Success',
        content: { 'application/json': { schema: SuccessSchema } },
      },
    },
    summary: 'Delete a project',
    tags: ['Projects'],
  },
  async (c) => {
    const { id } = c.req.valid('param');
    await repo.deleteProject(id);
    return c.json({ success: true });
  }
);

// POST /api/logs
app.openapi(
  {
    method: 'post',
    path: '/api/logs',
    request: {
      body: {
        content: {
          'application/json': { schema: LogCreateSchema },
        },
      },
    },
    responses: {
      201: {
        description: 'Created log',
        content: { 'application/json': { schema: LogSchema } },
      },
    },
    summary: 'Create a new log entry',
    tags: ['Logs'],
  },
  async (c) => {
    const data = c.req.valid('json');
    const log = await logRepo.createLog(data);
    return c.json(log, 201);
  }
);

// GET /api/logs
app.openapi(
  {
    method: 'get',
    path: '/api/logs',
    responses: {
      200: {
        description: 'List of logs',
        content: { 'application/json': { schema: LogSchema.array() } },
      },
    },
    summary: 'Get all logs',
    tags: ['Logs'],
  },
  async (c) => {
    const logs = await logRepo.getAllLogs();
    return c.json(logs);
  }
);

// GET /api/logs/{id}
app.openapi(
  {
    method: 'get',
    path: '/api/logs/{id}',
    request: {
      params: z.object({ id: z.string().openapi({ param: { name: 'id', in: 'path' }, example: 'uuid' }) }),
    },
    responses: {
      200: {
        description: 'Log',
        content: { 'application/json': { schema: LogSchema } },
      },
      404: { description: 'Not found' },
    },
    summary: 'Get a log by ID',
    tags: ['Logs'],
  },
  async (c) => {
    const { id } = c.req.valid('param');
    const log = await logRepo.getLogById(id);
    if (!log) return c.notFound();
    return c.json(log);
  }
);

// GET /api/logs/by-project/{projectId}
app.openapi(
  {
    method: 'get',
    path: '/api/logs/by-project/{projectId}',
    request: {
      params: z.object({ projectId: z.string().openapi({ param: { name: 'projectId', in: 'path' }, example: 'project-uuid' }) }),
    },
    responses: {
      200: {
        description: 'Logs for a project',
        content: { 'application/json': { schema: LogSchema.array() } },
      },
    },
    summary: 'Get logs by project ID',
    tags: ['Logs'],
  },
  async (c) => {
    const { projectId } = c.req.valid('param');
    const logs = await logRepo.getLogsByProjectId(projectId);
    return c.json(logs);
  }
);

// Serve OpenAPI spec at /doc
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    title: 'Project API',
    version: '1.0.0',
    description: 'Project management endpoints',
  },
});

// Swagger UI integration
app.get('/ui', swaggerUI({ url: '/doc' }));

export function startProjectServer() {
  serve({ fetch: app.fetch, port: 5173, hostname: '127.0.0.1' });
  console.log('Project API server running at http://127.0.0.1:5173');
  console.log('Swagger UI available at http://127.0.0.1:5173/ui');
  console.log('OpenAPI spec available at http://127.0.0.1:5173/doc');
} 