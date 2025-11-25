import express from 'express';
import { z } from 'zod';
import { container } from '../../container.gen.js';

// Validation schemas
const LogMetadataSchema = z.object({
  id: z.string().optional(),
  logId: z.string().optional(),
  key: z.string(),
  value: z.string().default("No value"),
});

const LogCreateSchema = z.object({
  projectId: z.string(),
  level: z.string(),
  message: z.string(),
  timestamp: z.string(),
  metadata: z.array(LogMetadataSchema).optional(),
});

const BulkLogCreateSchema = z.object({
  logs: z.array(LogCreateSchema),
});

const LogCursorSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
});

const LogPaginationParamsSchema = z.object({
  limit: z.string(),
  cursor: LogCursorSchema.optional(),
  sortDirection: z.enum(['asc', 'desc']),
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

export function createLogRouter(): express.Router {
  const router = express.Router();


  const createLog = container.resolve("CreateLog");
  const createBulkLog = container.resolve("CreateBulkLog");
  const getLogById = container.resolve("GetLogById");
  const getAllLogs = container.resolve("GetAllLogs");

  // POST /api/logs
  router.post('/',
    validateBody(LogCreateSchema),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const logData = req.body;
      const log = await createLog.execute({
        message: logData.message,
        projectId: logData.projectId,
        level: logData.level,
        timestamp: logData.timestamp,
        metadata: logData.metadata || []
      });
      res.status(201).json(log);
    })
  );

  // POST /api/logs/bulk
  router.post('/bulk',
    validateBody(BulkLogCreateSchema),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { logs } = req.body;
      const logsData = logs.map((logData: any) => ({
        message: logData.message,
        projectId: logData.projectId,
        level: logData.level,
        timestamp: logData.timestamp,
        metadata: logData.metadata || []
      }));
      const createdLogs = await createBulkLog.execute(logsData);
      res.status(201).json(createdLogs);
    })
  );

  // GET /api/logs
  router.get('/',
    validateQuery(LogPaginationParamsSchema.partial()),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const params = (req as any).validatedQuery || req.query;
      const logs = await getAllLogs.execute(params);
      res.json(logs);
    })
  );

  // GET /api/logs/:id
  router.get('/:id',
    validateParams(z.object({ id: z.string() })),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { id } = req.params;
      const log = await getLogById.execute(id);
      if (!log) {
        res.status(404).json({ error: 'Log not found' });
        return;
      }
      res.json(log);
    })
  );

  return router;
}