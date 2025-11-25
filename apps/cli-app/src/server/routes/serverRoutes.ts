import express from 'express';
import { z } from 'zod';
import { container } from '../../container.gen.js';

// Validation middleware
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

export function createServerRouter(): express.Router {
  const router = express.Router();

  // Initialize managers and use cases

  const getServerLogs = container.resolve("GetServerLogs");
  const getMCPServerLogs = container.resolve("GetMCPServerLogs");
  const restartServer = container.resolve("RestartServer");
  const restartMCPServer = container.resolve("RestartMCPServer");
  const clearServerLogs = container.resolve("ClearServerLogs");
  const clearMCPServerLogs = container.resolve("ClearMCPServerLogs");

  // GET /api/server/logs
  router.get('/logs',
    validateQuery(z.object({ type: z.enum(['all', 'stdout', 'stderr']).optional() })),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { type } = (req as any).validatedQuery || req.query;
      const validType = ['all', 'stdout', 'stderr'].includes(type as string) ? (type as 'all' | 'stdout' | 'stderr') : 'all';
      const logs = await getServerLogs.execute(validType);
      res.json(logs);
    })
  );

  // GET /api/server/mcp-logs
  router.get('/mcp-logs',
    validateQuery(z.object({ type: z.enum(['all', 'stdout', 'stderr']).optional() })),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { type } = (req as any).validatedQuery || req.query;
      const validType = ['all', 'stdout', 'stderr'].includes(type as string) ? (type as 'all' | 'stdout' | 'stderr') : 'all';
      const logs = await getMCPServerLogs.execute(validType);
      res.json(logs);
    })
  );

  // POST /api/server/restart
  router.post('/restart', asyncHandler(async (req: express.Request, res: express.Response) => {
    await restartServer.execute();
    res.json({ success: true });
  }));

  // POST /api/server/mcp/restart
  router.post('/mcp/restart', asyncHandler(async (req: express.Request, res: express.Response) => {
    await restartMCPServer.execute();
    res.json({ success: true });
  }));

  // POST /api/server/logs/clear
  router.post('/logs/clear',
    validateQuery(z.object({ type: z.enum(['all', 'stdout', 'stderr']).optional() })),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { type } = req.body || {};
      const validType = ['all', 'stdout', 'stderr'].includes(type as string) ? (type as 'all' | 'stdout' | 'stderr') : 'all';
      await clearServerLogs.execute(validType);
      res.json({ success: true });
    })
  );

  // POST /api/server/mcp-logs/clear
  router.post('/mcp-logs/clear',
    validateQuery(z.object({ type: z.enum(['all', 'stdout', 'stderr']).optional() })),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { type } = req.body || {};
      const validType = ['all', 'stdout', 'stderr'].includes(type as string) ? (type as 'all' | 'stdout' | 'stderr') : 'all';
      await clearMCPServerLogs.execute(validType);
      res.json({ success: true });
    })
  );

  return router;
}