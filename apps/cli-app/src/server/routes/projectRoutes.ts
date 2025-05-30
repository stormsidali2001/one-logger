import express from 'express';
import { z } from 'zod';
import { ProjectRepository } from '../../repositories/projectRepository.js';
import { LogRepository } from '../../repositories/logRepository.js';
import { GetAllProjects } from '../../use-cases/getAllProjects.js';
import { GetProjectById } from '../../use-cases/getProjectById.js';
import { CreateProject } from '../../use-cases/createProject.js';
import { UpdateProject } from '../../use-cases/updateProject.js';
import { DeleteProject } from '../../use-cases/deleteProject.js';
import { GetProjectMetrics } from '../../use-cases/getProjectMetrics.js';
import { GetLogsByProjectId } from '../../use-cases/getLogsByProjectId.js';
import { GetHistoricalLogCounts } from '../../use-cases/getHistoricalLogCounts.js';
import { GetMetadataKeysByProjectId } from '../../use-cases/getMetadataKeysByProjectId.js';
import { GetProjectConfig } from '../../use-cases/getProjectConfig.js';
import { UpdateProjectConfig } from '../../use-cases/updateProjectConfig.js';
import { ClearProjectLogs } from '../../use-cases/clearProjectLogs.js';
import { timestamp } from 'drizzle-orm/gel-core/index.js';

// Validation schemas
const ProjectCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

const ProjectUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

const ProjectConfigSchema = z.object({
  trackedMetadataKeys: z.array(z.string()).optional(),
});

// Validation middleware
const validateBody = (schema: z.ZodSchema) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
        return;
      }
      next(error);
    }
  };
};

const validateParams = (schema: z.ZodSchema) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
        return;
      }
      next(error);
    }
  };
};

const validateQuery = (schema: z.ZodSchema) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const validatedQuery = schema.parse(req.query);
      (req as any).validatedQuery = validatedQuery;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
        return;
      }
      next(error);
    }
  };
};

// Error handling middleware
const asyncHandler = (fn: Function) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export function createProjectRouter(): express.Router {
  const router = express.Router();
  
  // Initialize repositories and use cases
  const projectRepository = new ProjectRepository();
  const logRepository = new LogRepository();
  
  const getAllProjects = new GetAllProjects(projectRepository);
  const getProjectById = new GetProjectById(projectRepository);
  const createProject = new CreateProject(projectRepository);
  const updateProject = new UpdateProject(projectRepository);
  const deleteProject = new DeleteProject(projectRepository);
  const getProjectMetrics = new GetProjectMetrics(logRepository);
  const getLogsByProjectId = new GetLogsByProjectId(logRepository);
  const getHistoricalLogCounts = new GetHistoricalLogCounts(logRepository);
  const getMetadataKeysByProjectId = new GetMetadataKeysByProjectId(logRepository);
  const getProjectConfig = new GetProjectConfig(projectRepository);
  const updateProjectConfig = new UpdateProjectConfig(projectRepository);
  const clearProjectLogs = new ClearProjectLogs(logRepository);

  // GET /api/projects
  router.get('/', asyncHandler(async (req: express.Request, res: express.Response) => {
    const projects = await getAllProjects.execute();
    res.json(projects);
  }));

  // GET /api/projects/:id
  router.get('/:id', 
    validateParams(z.object({ id: z.string() })),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { id } = req.params;
      const project = await getProjectById.execute(id);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      res.json(project);
    })
  );

  // GET /api/projects/exists/:name
  router.get('/exists/:name',
    validateParams(z.object({ name: z.string() })),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { name } = req.params;
      const project = await projectRepository.getProjectByName(name);
      res.json({ exists: !!project });
    })
  );

  // POST /api/projects
  router.post('/',
    validateBody(ProjectCreateSchema),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const projectData = req.body;
      const project = await createProject.execute({
        name: projectData.name,
        description: projectData.description || '',
        
      });
      res.status(201).json(project);
    })
  );

  // PUT /api/projects/:id
  router.put('/:id',
    validateParams(z.object({ id: z.string() })),
    validateBody(ProjectUpdateSchema),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { id } = req.params;
      const updateData = req.body;
      const project = await updateProject.execute(id, updateData);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      res.json(project);
    })
  );

  // DELETE /api/projects/:id
  router.delete('/:id',
    validateParams(z.object({ id: z.string() })),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { id } = req.params;
      try {
        await deleteProject.execute(id);
        res.json({ success: true });
      } catch (err) {
        console.error("Something went wrong when deleting project" + id);
        res.status(500).json({ error: "Something went wrong" });
      }
    })
  );

  // GET /api/projects/:projectId/metrics
  router.get('/:projectId/metrics',
    validateParams(z.object({ projectId: z.string() })),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { projectId } = req.params;
      const metrics = await getProjectMetrics.execute(projectId);
      res.json(metrics);
    })
  );

  // GET /api/projects/:projectId/logs
  router.get('/:projectId/logs',
    validateParams(z.object({ projectId: z.string() })),
    validateQuery(z.object({ 
      limit: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
      cursor: z.string().optional().transform(val => val? JSON.parse(val) : undefined), // Assuming cursor is a JSON stringified objec,
      sortDirection: z.enum(['asc', 'desc']).optional(),
      level: z.union([z.string(), z.array(z.string())]).optional(),
      messageContains: z.string().optional(),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
      metaContains: z.string().optional().transform(val => val ? JSON.parse(val) : undefined),
      metadata: z.string().optional().transform(val => val ? JSON.parse(val) : undefined)
    })),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { projectId } = req.params;
      const { limit, cursor, sortDirection, level, messageContains, fromDate, toDate, metaContains, metadata } = (req as any).validatedQuery;
      
      const options: any = { projectId };
      if (limit) options.limit = limit;
      if(cursor) {
       const cursorSchema = z.object({
        id: z.string(),
        timestamp: z.string()}) 
        const parsedCursor = cursorSchema.safeParse(cursor)
        if(!parsedCursor.success) {
          res.status(400).json({ error: 'Validation error', details: parsedCursor.error.errors });
          return;
        }
        options.cursor = cursor

      };
      if (sortDirection) options.sortDirection = sortDirection;
      if (level) options.level = level;
      if (messageContains) options.messageContains = messageContains;
      if (fromDate) options.fromDate = fromDate;
      if (toDate) options.toDate = toDate;
      if (metaContains) options.metaContains = metaContains;
      if (metadata) options.metadata = metadata;
      console.log("filtering options",options)
      
      const logs = await getLogsByProjectId.execute(projectId, options);
      res.json(logs);
    })
  );

  // GET /api/projects/:projectId/logs/historical-counts
  router.get('/:projectId/logs/historical-counts',
    validateParams(z.object({ projectId: z.string() })),
    validateQuery(z.object({ days: z.string().optional() })),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { projectId } = req.params;
      const { days } = (req as any).validatedQuery || req.query;
      const counts = await getHistoricalLogCounts.execute(projectId, days ? parseInt(days as string) : 7);
      res.json(counts);
    })
  );

  // GET /api/projects/:projectId/metadata-keys
  router.get('/:projectId/metadata-keys',
    validateParams(z.object({ projectId: z.string() })),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { projectId } = req.params;
      const keys = await getMetadataKeysByProjectId.execute(projectId);
      res.json(keys);
    })
  );

  // GET /api/projects/:projectId/config
  router.get('/:projectId/config',
    validateParams(z.object({ projectId: z.string() })),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { projectId } = req.params;
      const config = await getProjectConfig.execute(projectId);
      res.json(config);
    })
  );

  // PUT /api/projects/:projectId/config
  router.put('/:projectId/config',
    validateParams(z.object({ projectId: z.string() })),
    validateBody(ProjectConfigSchema),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { projectId } = req.params;
      const configData = req.body;
      await updateProjectConfig.execute(projectId, configData);
      res.json({ success: true });
    })
  );

  // DELETE /api/projects/:projectId/logs - Clear all logs for a project
  router.delete('/:projectId/logs',
    validateParams(z.object({ projectId: z.string() })),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { projectId } = req.params;
      try {
        await clearProjectLogs.execute(projectId);
        res.json({ success: true, message: 'All logs cleared for project' });
      } catch (err) {
        console.error('Error clearing logs for project ' + projectId, err);
        res.status(500).json({ error: 'Failed to clear project logs' });
      }
    })
  );

  // GET /api/metadata/keys - Global metadata keys endpoint
  router.get('/metadata/keys',
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const keys = await logRepository.getMetadataKeys();
      res.json(keys);
    })
  );

  return router;
}