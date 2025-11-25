import express from 'express';
import { z } from 'zod';
import { container } from '../../container.gen.js';

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

// Error handling middleware
const asyncHandler = (fn: Function) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export function createConfigRouter(): express.Router {
  const router = express.Router();


  const getConfig = container.resolve("GetConfig")
  const getAllConfig = container.resolve("GetAllConfig")
  const setConfig = container.resolve("SetConfig")

  // GET /api/config
  router.get('/', asyncHandler(async (req: express.Request, res: express.Response) => {
    const config = await getAllConfig.execute();
    res.json(config);
  }));

  // GET /api/config/:key
  router.get('/:key',
    validateParams(z.object({ key: z.string() })),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { key } = req.params;
      const value = await getConfig.execute(key);
      if (value === undefined) {
        res.status(404).json({ error: 'Configuration key not found' });
        return;
      }
      res.json({ value });
    })
  );

  // POST /api/config/:key
  router.post('/:key',
    validateParams(z.object({ key: z.string() })),
    validateBody(z.object({ value: z.any() })),
    asyncHandler(async (req: express.Request, res: express.Response) => {
      const { key } = req.params;
      const { value } = req.body;
      await setConfig.execute(key, value);
      res.json({ success: true });
    })
  );

  return router;
}