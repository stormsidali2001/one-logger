import express from 'express';
import { TraceRepository } from '../../repositories/traceRepository.js';
import { CreateTrace } from '../../use-cases/createTrace.js';
import { BulkCreateTraces } from '../../use-cases/bulkCreateTraces.js';
import { ProjectRepository } from '../../repositories/projectRepository.js';
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
  const projectRepository = new ProjectRepository();
  
  // Initialize use cases
  const createTrace = new CreateTrace(traceRepository);
  const bulkCreateTraces = new BulkCreateTraces(traceRepository, projectRepository);
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
      const { projectId, name, startTime, endTime, metadata } = req.body;
      
      if (!projectId || !name || !startTime) {
        return res.status(400).json({ error: 'Missing required fields: projectId, name, startTime' });
      }
      
      const trace = await createTrace.execute({
        projectId,
        name,
        startTime,
        endTime,
        metadata,
      });
      
      res.status(201).json(trace);
    } catch (error) {
      console.error('Error creating trace:', error);
      res.status(500).json({ error: 'Failed to create trace' });
    }
  }));

  // POST /api/traces/bulk - Create multiple traces
  router.post('/bulk', asyncHandler(async (req: express.Request, res: express.Response) => {
    try {
      const { traces } = req.body;
      
      if (!traces || !Array.isArray(traces) || traces.length === 0) {
        return res.status(400).json({ error: 'Missing or invalid traces array' });
      }
      
      console.log("receiving traces: ", traces)
      const createdTraces = await bulkCreateTraces.execute(traces);
      
      res.status(201).json({
        success: true,
        count: createdTraces.length,
        traces: createdTraces
      });
    } catch (error) {
      console.error('Error creating traces in bulk:', error);
      res.status(500).json({ error: 'Failed to create traces in bulk' });
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
      const { limit, sortDirection, cursor } = req.query;
      
      const options: any = {};
      if (limit) options.limit = parseInt(limit as string);
      if (sortDirection) options.sortDirection = sortDirection as 'asc' | 'desc';
      console.log("cursor: ", cursor)
      if(cursor){
        const parsedCursor = JSON.parse(cursor as string);

        options.cursor = {
          id: parsedCursor.id as string,
          timestamp: parsedCursor.timestamp as string
        };
      }
      
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
      const { id,parentSpanId, name, startTime, endTime, metadata } = req.body;
      
      if (!name || !startTime) {
        return res.status(400).json({ error: 'Missing required fields: name, startTime' });
      }
      
      const span = await createSpan.execute({
        id,
        traceId,
        parentSpanId,
        name,
        startTime,
        endTime,
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
      const { limit, sortDirection, cursorId, cursorTimestamp } = req.query;
      
      const options: any = {};
      if (limit) options.limit = parseInt(limit as string);
      if (sortDirection) options.sortDirection = sortDirection as 'asc' | 'desc';
      if (cursorId && cursorTimestamp) {
        options.cursor = {
          id: cursorId as string,
          timestamp: cursorTimestamp as string
        };
      }
      
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