import { OpenAPIHono, z } from '@hono/zod-openapi';
import { serve } from '@hono/node-server';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { ProjectRepository } from './repositories/projectRepository.js';
import { LogRepository } from './repositories/logRepository.js';
import { Log, LogMetadata } from '../types/log.js';
import { ConfigRepository } from './repositories/configRepository.js';

// Define schemas outside the function to avoid recreating them on each restart
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

// Updated to match the actual Log interface
const LogMetadataSchema = z.object({
  id: z.string().optional().openapi({ example: 'metadata-uuid' }),
  logId: z.string().optional().openapi({ example: 'log-uuid' }),
  key: z.string().openapi({ example: 'ip' }),
  value: z.string().openapi({ example: '192.168.1.1' }),
}).openapi('LogMetadata');

const LogSchema = z.object({
  id: z.string().openapi({ example: 'uuid' }),
  projectId: z.string().openapi({ example: 'project-uuid' }),
  level: z.string().openapi({ example: 'info' }),
  message: z.string().openapi({ example: 'A log message' }),
  timestamp: z.string().openapi({ example: '2024-05-17T12:00:00Z' }),
  metadata: z.array(LogMetadataSchema).openapi({ example: [{ key: 'ip', value: '192.168.1.1' }] }),
}).openapi('Log');

const LogCreateSchema = z.object({
  projectId: z.string().openapi({ example: 'project-uuid' }),
  level: z.string().openapi({ example: 'info' }),
  message: z.string().openapi({ example: 'A log message' }),
  timestamp: z.string().openapi({ example: '2024-05-17T12:00:00Z' }),
  metadata: z.array(LogMetadataSchema).optional().openapi({ example: [{ key: 'ip', value: '192.168.1.1' }] }),
}).openapi('LogCreate');

const LogCursorSchema = z.object({
  id: z.string().openapi({ example: 'uuid' }),
  timestamp: z.string().openapi({ example: '2024-05-17T12:00:00Z' }),
}).openapi('LogCursor');

const LogPaginationParamsSchema = z.object({
  limit: z.coerce.number().optional().openapi({ example: 20, type: 'string' }),
  cursor: LogCursorSchema.optional(),
  sortDirection: z.enum(['asc', 'desc']).optional().openapi({ example: 'desc' }),
}).openapi('LogPaginationParams');

export async function startProjectServer(logger?: { log: (...args: unknown[]) => void, error: (...args: unknown[]) => void }) {
  try {
    // Use custom logger if provided, otherwise use console
    const log = logger?.log || console.log;
    const error = logger?.error || console.error;

    // Create a new Hono app instance for each server restart
    const app = new OpenAPIHono();
    
    // Use ConfigRepository for config access
    const configRepo = new ConfigRepository();

    // Check if server is enabled - default to true if not set
    const enabledConfig = await configRepo.getValue('server.enabled');
    const isEnabled = enabledConfig !== 'false'; // Default to true if not set

    if (!isEnabled) {
      log('Project API server is disabled in settings');
      return null;
    }

    // Get port configuration
    const portConfig = await configRepo.getValue('server.port');
    const port = portConfig ? parseInt(portConfig, 10) : 5173;

    // Get CORS configuration
    const corsConfig = await configRepo.getValue('server.corsOrigins');
    let corsOrigins = ['http://localhost:5173']; // Default

    if (corsConfig) {
      try {
        const parsedOrigins = JSON.parse(corsConfig);
        if (Array.isArray(parsedOrigins) && parsedOrigins.length > 0) {
          corsOrigins = parsedOrigins;
        }
      } catch (err) {
        error('Error parsing CORS origins:', err);
      }
    }

    // Add CORS middleware
    app.use('/*', cors({
      origin: corsOrigins,
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
      exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
      maxAge: 600,
      credentials: true,
    }));

    // Create repository instances
    const repo = new ProjectRepository();
    const logRepo = new LogRepository();
    
    // Define all routes
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

    // GET /api/projects/name/:name/exists
    app.openapi(
      {
        method: 'get',
        path: '/api/projects/name/{name}/exists',
        request: {
          params: z.object({ name: z.string().openapi({ param: { name: 'name', in: 'path' }, example: 'My Project' }) }),
        },
        responses: {
          200: {
            description: 'Whether project name exists',
            content: { 'application/json': { schema: z.object({ exists: z.boolean() }).openapi('ProjectNameExists') } },
          },
        },
        summary: 'Check if a project name already exists',
        tags: ['Projects'],
      },
      async (c) => {
        const { name } = c.req.valid('param');
        const project = await repo.getProjectByName(name);
        return c.json({ exists: !!project });
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
        // Ensure metadata is always an array
        const logData: Omit<Log, 'id'> = {
          projectId: data.projectId,
          level: data.level,
          message: data.message,
          timestamp: data.timestamp,
          metadata: data.metadata || [],
        };
        const log = await logRepo.createLog(logData);
        return c.json(log, 201);
      }
    );

    // GET /api/logs
    app.openapi(
      {
        method: 'get',
        path: '/api/logs',
        request: {
          query: LogPaginationParamsSchema,
        },
        responses: {
          200: {
            description: 'List of logs',
            content: { 'application/json': { schema: LogSchema.array() } },
          },
        },
        summary: 'Get all logs with pagination',
        tags: ['Logs'],
      },
      async (c) => {
        const params = c.req.valid('query');
        const logs = await logRepo.getLogsWithFilters({
          projectId: '*', // Special case to get all logs
          limit: params.limit,
          cursor: params.cursor,
          sortDirection: params.sortDirection,
        });
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
          query: LogPaginationParamsSchema,
        },
        responses: {
          200: {
            description: 'Logs for a project',
            content: { 'application/json': { schema: LogSchema.array() } },
          },
        },
        summary: 'Get logs by project ID with pagination',
        tags: ['Logs'],
      },
      async (c) => {
        const { projectId } = c.req.valid('param');
        const params = c.req.valid('query');

        const logs = await logRepo.getLogsWithFilters({
          projectId,
          limit: params.limit,
          cursor: params.cursor,
          sortDirection: params.sortDirection,
        });
        return c.json(logs);
      }
    );

    // GET /api/logs/metadata-keys/{projectId}
    app.openapi(
      {
        method: 'get',
        path: '/api/logs/metadata-keys/{projectId}',
        request: {
          params: z.object({ projectId: z.string().openapi({ param: { name: 'projectId', in: 'path' }, example: 'project-uuid' }) }),
        },
        responses: {
          200: {
            description: 'Unique metadata keys for a project',
            content: { 'application/json': { schema: z.array(z.string()) } },
          },
        },
        summary: 'Get unique metadata keys by project ID',
        tags: ['Logs'],
      },
      async (c) => {
        const { projectId } = c.req.valid('param');
        const keys = await logRepo.getUniqueMetadataKeysByProjectId(projectId);
        return c.json(keys);
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

    // Start the server with the configured port
    const server = serve({ fetch: app.fetch, port, hostname: '127.0.0.1' });
    log(`Project API server running at http://127.0.0.1:${port}`);
    log(`Swagger UI available at http://127.0.0.1:${port}/ui`);
    log(`OpenAPI spec available at http://127.0.0.1:${port}/doc`);

    // Return the server instance so it can be closed if needed
    return server;
  } catch (error) {
    console.error('Failed to start project server:', error);
    return null;
  }
} 