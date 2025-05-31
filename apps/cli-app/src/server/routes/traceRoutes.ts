import express from 'express';
import { TraceRepository } from '../../repositories/traceRepository.js';
import { CreateTrace } from '../../use-cases/createTrace.js';
import { GetTraceById } from '../../use-cases/getTraceById.js';
import { GetTracesByProjectId } from '../../use-cases/getTracesByProjectId.js';
import { UpdateTrace } from '../../use-cases/updateTrace.js';
import { CreateSpan } from '../../use-cases/createSpan.js';
import { GetSpansByTraceId } from '../../use-cases/getSpansByTraceId.js';
import { UpdateSpan } from '../../use-cases/updateSpan.js';
import { GetTraceWithSpans } from '../../use-cases/getTraceWithSpans.js';
import { ClearProjectTraces } from '../../use-cases/clearProjectTraces.js';

// Error handling middleware
const asyncHandler = (fn: Function) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export function createTraceRouter(): express.Router {
  const router = express.Router();
  const traceRepository = new TraceRepository();
  
  // Initialize use cases
  const createTrace = new CreateTrace(traceRepository);
  const getTraceById = new GetTraceById(traceRepository);
  const getTracesByProjectId = new GetTracesByProjectId(traceRepository);
  const updateTrace = new UpdateTrace(traceRepository);
  const createSpan = new CreateSpan(traceRepository);
  const getSpansByTraceId = new GetSpansByTraceId(traceRepository);
  const updateSpan = new UpdateSpan(traceRepository);
  const getTraceWithSpans = new GetTraceWithSpans(traceRepository);
  const clearProjectTraces = new ClearProjectTraces(traceRepository);

  // Trace endpoints
  
  // POST /api/traces - Create a new trace
  router.post('/', asyncHandler(async (req: express.Request, res: express.Response) => {
    try {
      const { projectId, name, startTime, metadata } = req.body;
      
      if (!projectId || !name || !startTime) {
        return res.status(400).json({ error: 'Missing required fields: projectId, name, startTime' });
      }
      
      const trace = await createTrace.execute({
        projectId,
        name,
        startTime,
        metadata,
      });
      
      res.status(201).json(trace);
    } catch (error) {
      console.error('Error creating trace:', error);
      res.status(500).json({ error: 'Failed to create trace' });
    }
  }));

  // GET /api/traces/:id - Get trace by ID
  router.get('/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const trace = await getTraceById.execute(id);
      
      if (!trace) {
        return res.status(404).json({ error: 'Trace not found' });
      }
      
      res.json(trace);
    } catch (error) {
      console.error('Error getting trace:', error);
      res.status(500).json({ error: 'Failed to get trace' });
    }
  }));

  // PUT /api/traces/:id - Update trace
  router.put('/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const { endTime, duration, status, metadata } = req.body;
      
      const trace = await updateTrace.execute(id, {
        endTime,
        duration,
        status,
        metadata,
      });
      
      if (!trace) {
        return res.status(404).json({ error: 'Trace not found' });
      }
      
      res.json(trace);
    } catch (error) {
      console.error('Error updating trace:', error);
      res.status(500).json({ error: 'Failed to update trace' });
    }
  }));

  // GET /api/traces/:id/complete - Get trace with all spans
  router.get('/:id/complete', asyncHandler(async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const result = await getTraceWithSpans.execute(id);
      
      if (!result) {
        return res.status(404).json({ error: 'Trace not found' });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error getting complete trace:', error);
      res.status(500).json({ error: 'Failed to get complete trace' });
    }
  }));

  // GET /api/traces/project/:projectId - Get traces by project ID
  router.get('/project/:projectId', asyncHandler(async (req: express.Request, res: express.Response) => {
    try {
      const { projectId } = req.params;
      const { limit, offset, sortDirection } = req.query;
      
      const options: any = {};
      if (limit) options.limit = parseInt(limit as string);
      if (offset) options.offset = parseInt(offset as string);
      if (sortDirection) options.sortDirection = sortDirection as 'asc' | 'desc';
      
      const traces = await getTracesByProjectId.execute(projectId, options);
      res.json(traces);
    } catch (error) {
      console.error('Error getting traces by project:', error);
      res.status(500).json({ error: 'Failed to get traces' });
    }
  }));

  // DELETE /api/traces/project/:projectId - Clear all traces for a project
  router.delete('/project/:projectId', asyncHandler(async (req: express.Request, res: express.Response) => {
    try {
      const { projectId } = req.params;
      await clearProjectTraces.execute(projectId);
      res.status(204).send();
    } catch (error) {
      console.error('Error clearing project traces:', error);
      res.status(500).json({ error: 'Failed to clear project traces' });
    }
  }));

  // Span endpoints
  
  // POST /api/traces/:traceId/spans - Create a new span
  router.post('/:traceId/spans', asyncHandler(async (req: express.Request, res: express.Response) => {
    try {
      const { traceId } = req.params;
      const { parentSpanId, name, startTime, metadata } = req.body;
      
      if (!name || !startTime) {
        return res.status(400).json({ error: 'Missing required fields: name, startTime' });
      }
      
      const span = await createSpan.execute({
        traceId,
        parentSpanId,
        name,
        startTime,
        metadata,
      });
      
      res.status(201).json(span);
    } catch (error) {
      console.error('Error creating span:', error);
      res.status(500).json({ error: 'Failed to create span' });
    }
  }));

  // GET /api/traces/:traceId/spans - Get spans by trace ID
  router.get('/:traceId/spans', asyncHandler(async (req: express.Request, res: express.Response) => {
    try {
      const { traceId } = req.params;
      const { limit, offset, sortDirection } = req.query;
      
      const options: any = {};
      if (limit) options.limit = parseInt(limit as string);
      if (offset) options.offset = parseInt(offset as string);
      if (sortDirection) options.sortDirection = sortDirection as 'asc' | 'desc';
      
      const spans = await getSpansByTraceId.execute(traceId, options);
      res.json(spans);
    } catch (error) {
      console.error('Error getting spans:', error);
      res.status(500).json({ error: 'Failed to get spans' });
    }
  }));

  // PUT /api/traces/spans/:spanId - Update span
  router.put('/spans/:spanId', asyncHandler(async (req: express.Request, res: express.Response) => {
    try {
      const { spanId } = req.params;
      const { endTime, duration, status, metadata } = req.body;
      
      const span = await updateSpan.execute(spanId, {
        endTime,
        duration,
        status,
        metadata,
      });
      
      if (!span) {
        return res.status(404).json({ error: 'Span not found' });
      }
      
      res.json(span);
    } catch (error) {
      console.error('Error updating span:', error);
      res.status(500).json({ error: 'Failed to update span' });
    }
  }));

  return router;
}