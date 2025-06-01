import { db, Drizzle, DrizzleTransaction } from '../db/db.js';
import { traces, spans } from '../db/schema.js';
import { eq, and, desc, asc, lt, gt, or, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import type {
  TraceData,
  SpanData,
  CreateTraceData,
  CreateSpanData,
  UpdateTraceData,
  UpdateSpanData,
  TraceQueryOptions,
  SpanQueryOptions
} from '../types/trace.js';

export class TraceRepository {
  // Trace operations
  async createTrace(data: CreateTraceData,tsx:DrizzleTransaction | null =null): Promise<TraceData> {
    const drizzle = tsx?tsx:( await db.getDrizzle());
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    
    
    const traceData = {
      id,
      projectId: data.projectId,
      name: data.name,
      startTime: data.startTime,
      endTime: data.endTime ,
      status: 'running' as const, // Default to 'running' if not provided in dat,
      metadata: JSON.stringify(data.metadata || {}),
      createdAt,
    };
    

    let createdSpans: SpanData[] = [];
    const res = await drizzle.transaction(async(tsx1)=>{

    await tsx1.insert(traces).values(traceData);
    if(data.spans && data.spans.length >0){

    for(const span of data.spans){
      const newSpan = await this.createSpan({...span,traceId:id},tsx1);
      createdSpans.push(newSpan);
    }
    }
    return {
      ...traceData,
      metadata: data.metadata || {},
      spans:createdSpans  // Add the spans to the response
    };

    })
    return res;
  }

  async getTraceById(id: string): Promise<TraceData | undefined> {
    const drizzle = await db.getDrizzle();
    const result = await drizzle.select().from(traces).where(eq(traces.id, id)).get();
    
    if (!result) return undefined;
    
    return {
      id: result.id,
      projectId: result.projectId,
      name: result.name,
      startTime: result.startTime,
      endTime: result.endTime || undefined,
      duration: result.duration || undefined,
      status: result.status as 'running' | 'completed' | 'failed',
      metadata: JSON.parse(result.metadata),
      createdAt: result.createdAt,
    };
  }

  async getTracesByProjectId(projectId: string, options: TraceQueryOptions = {}): Promise<{ traces: TraceData[]; hasNextPage: boolean }> {
    const drizzle = await db.getDrizzle();
    const { limit = 50, sortDirection = 'desc', cursor } = options;
    const fetchLimitPlusOne = limit + 1; // Fetch one extra to determine hasNextPage
    
    // Build conditions
    const conditions: any[] = [eq(traces.projectId, projectId)];
    
    // Add cursor conditions for pagination
    if (cursor) {
      const cursorTimestamp = cursor.timestamp;
      const cursorId = cursor.id;
      
      if (sortDirection === 'desc') {
        conditions.push(
          or(
            lt(traces.startTime, cursorTimestamp),
            and(eq(traces.startTime, cursorTimestamp), lt(traces.id, cursorId))
          )
        );
      } else { // asc
        conditions.push(
          or(
            gt(traces.startTime, cursorTimestamp),
            and(eq(traces.startTime, cursorTimestamp), gt(traces.id, cursorId))
          )
        );
      }
    }
    
    const orderBy = sortDirection === 'desc' 
      ? [desc(traces.startTime), desc(traces.id)] 
      : [asc(traces.startTime), asc(traces.id)];
    
    // First, get the traces with pagination
    const traceResults = await drizzle
      .select()
      .from(traces)
      .where(and(...conditions))
      .orderBy(...orderBy)
      .limit(fetchLimitPlusOne)
      .all();
    
    // Determine if there's a next page
    const hasNextPage = traceResults.length > limit;
    
    // Return the first `limit` traces
    const tracesToReturn = hasNextPage ? traceResults.slice(0, limit) : traceResults;
    
    // Get all spans for the returned traces in a single query
    const traceIds = tracesToReturn.map(trace => trace.id);
    const spansResults = traceIds.length > 0 ? await drizzle
      .select()
      .from(spans)
      .where(inArray(spans.traceId, traceIds))
      .orderBy(asc(spans.startTime))
      .all() : [];
    
    // Convert raw spans to SpanData format
    const allSpans: SpanData[] = spansResults.map(span => ({
      id: span.id,
      traceId: span.traceId,
      parentSpanId: span.parentSpanId || undefined,
      name: span.name,
      startTime: span.startTime,
      endTime: span.endTime || undefined,
      duration: span.duration || undefined,
      status: span.status as 'running' | 'completed' | 'failed',
      metadata: JSON.parse(span.metadata),
      createdAt: span.createdAt,
    }));
    
    // Group spans by trace ID and build hierarchy for each trace
    const spansByTraceId = allSpans.reduce((acc, span) => {
      if (!acc[span.traceId]) {
        acc[span.traceId] = [];
      }
      acc[span.traceId].push(span);
      return acc;
    }, {} as Record<string, SpanData[]>);
    
    // Build hierarchy for each trace's spans
    Object.keys(spansByTraceId).forEach(traceId => {
      spansByTraceId[traceId] = this.buildSpanHierarchy(spansByTraceId[traceId]);
    });
    
    return {
      traces: tracesToReturn.map(result => ({
        id: result.id,
        projectId: result.projectId,
        name: result.name,
        startTime: result.startTime,
        endTime: result.endTime || undefined,
        duration: result.duration || undefined,
        status: result.status as 'running' | 'completed' | 'failed',
        metadata: JSON.parse(result.metadata),
        createdAt: result.createdAt,
        spans: spansByTraceId[result.id] || [], 
      })),
      hasNextPage,
    };
  }

  async updateTrace(id: string, data: UpdateTraceData): Promise<TraceData | undefined> {
    const drizzle = await db.getDrizzle();
    
    const updateData: any = {};
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.metadata !== undefined) updateData.metadata = JSON.stringify(data.metadata);
    
    await drizzle.update(traces).set(updateData).where(eq(traces.id, id));
    
    return this.getTraceById(id);
  }

  async deleteTrace(id: string): Promise<void> {
    const drizzle = await db.getDrizzle();
    await drizzle.delete(traces).where(eq(traces.id, id));
  }

  private buildSpanHierarchy(spans: SpanData[]): SpanData[] {
    // Create a map for quick lookup
    const spanMap = new Map<string, SpanData>();
    const rootSpans: SpanData[] = [];
    
    // Initialize all spans in the map with empty spans array
    spans.forEach(span => {
      spanMap.set(span.id, { ...span, spans: [] });
    });
    
    // Build the hierarchy
    spans.forEach(span => {
      const spanWithChildren = spanMap.get(span.id)!;
      
      if (span.parentSpanId) {
        // This span has a parent, add it to parent's spans array
        const parent = spanMap.get(span.parentSpanId);
        if (parent) {
          parent.spans!.push(spanWithChildren);
        } else {
          // Parent not found, treat as root
          rootSpans.push(spanWithChildren);
        }
      } else {
        // This is a root span
        rootSpans.push(spanWithChildren);
      }
    });
    
    return rootSpans;
  }

  async bulkTraceInsert(tracesData: CreateTraceData[]): Promise<TraceData[]> {
    const drizzle = await db.getDrizzle();
    
    return await drizzle.transaction(async (tsx) => {
      const createdTraces: TraceData[] = [];
      
      for (const traceData of tracesData) {
        const createdTrace = await this.createTrace(traceData, tsx as DrizzleTransaction);
        createdTraces.push(createdTrace);
      }
      
      return createdTraces;
    });
  }

  // Span operations
  async createSpan(data: CreateSpanData,tsx:any=null ): Promise<SpanData> {
    const drizzle:Drizzle = tsx?tsx:( await db.getDrizzle());
    const createdAt = new Date().toISOString();
    
    const spanData = {
      id:data.id,
      traceId: data.traceId,
      parentSpanId: data.parentSpanId || null,
      name: data.name,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'running' as const,
      metadata: JSON.stringify(data.metadata || {}),
      createdAt,
    };
    
    await drizzle.insert(spans).values(spanData);
    
    return {
      ...spanData,
      parentSpanId: spanData.parentSpanId || undefined,
      metadata: data.metadata || {},
    };
  }

  async getSpanById(id: string): Promise<SpanData | undefined> {
    const drizzle = await db.getDrizzle();
    const result = await drizzle.select().from(spans).where(eq(spans.id, id)).get();
    
    if (!result) return undefined;
    
    return {
      id: result.id,
      traceId: result.traceId,
      parentSpanId: result.parentSpanId || undefined,
      name: result.name,
      startTime: result.startTime,
      endTime: result.endTime || undefined,
      duration: result.duration || undefined,
      status: result.status as 'running' | 'completed' | 'failed',
      metadata: JSON.parse(result.metadata),
      createdAt: result.createdAt,
    };
  }

  async getSpansByTraceId(traceId: string, options: SpanQueryOptions = {}): Promise<{ spans: SpanData[]; hasNextPage: boolean }> {
    const drizzle = await db.getDrizzle();
    const { limit = 100, sortDirection = 'asc', cursor } = options;
    const fetchLimitPlusOne = limit + 1; // Fetch one extra to determine hasNextPage
    
    // Build conditions
    const conditions: any[] = [eq(spans.traceId, traceId)];
    
    // Add cursor conditions for pagination
    if (cursor) {
      const cursorTimestamp = cursor.timestamp;
      const cursorId = cursor.id;
      
      if (sortDirection === 'desc') {
        conditions.push(
          or(
            lt(spans.startTime, cursorTimestamp),
            and(eq(spans.startTime, cursorTimestamp), lt(spans.id, cursorId))
          )
        );
      } else { // asc
        conditions.push(
          or(
            gt(spans.startTime, cursorTimestamp),
            and(eq(spans.startTime, cursorTimestamp), gt(spans.id, cursorId))
          )
        );
      }
    }
    
    const orderBy = sortDirection === 'desc' 
      ? [desc(spans.startTime), desc(spans.id)] 
      : [asc(spans.startTime), asc(spans.id)];
    
    const results = await drizzle
      .select()
      .from(spans)
      .where(and(...conditions))
      .orderBy(...orderBy)
      .limit(fetchLimitPlusOne)
      .all();
    
    // Determine if there's a next page
    const hasNextPage = results.length > limit;
    
    // Return the first `limit` spans
    const spansToReturn = hasNextPage ? results.slice(0, limit) : results;
    
    return {
      spans: spansToReturn.map(result => ({
        id: result.id,
        traceId: result.traceId,
        parentSpanId: result.parentSpanId || undefined,
        name: result.name,
        startTime: result.startTime,
        endTime: result.endTime || undefined,
        duration: result.duration || undefined,
        status: result.status as 'running' | 'completed' | 'failed',
        metadata: JSON.parse(result.metadata),
        createdAt: result.createdAt,
      })),
      hasNextPage,
    };
  }

  async getSpansByParentId(parentSpanId: string): Promise<SpanData[]> {
    const drizzle = await db.getDrizzle();
    
    const results = await drizzle
      .select()
      .from(spans)
      .where(eq(spans.parentSpanId, parentSpanId))
      .orderBy(asc(spans.startTime))
      .all();
    
    return results.map(result => ({
      id: result.id,
      traceId: result.traceId,
      parentSpanId: result.parentSpanId || undefined,
      name: result.name,
      startTime: result.startTime,
      endTime: result.endTime || undefined,
      duration: result.duration || undefined,
      status: result.status as 'running' | 'completed' | 'failed',
      metadata: JSON.parse(result.metadata),
      createdAt: result.createdAt,
    }));
  }

  async updateSpan(id: string, data: UpdateSpanData): Promise<SpanData | undefined> {
    const drizzle = await db.getDrizzle();
    
    const updateData: any = {};
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.metadata !== undefined) updateData.metadata = JSON.stringify(data.metadata);
    
    await drizzle.update(spans).set(updateData).where(eq(spans.id, id));
    
    return this.getSpanById(id);
  }

  async deleteSpan(id: string): Promise<void> {
    const drizzle = await db.getDrizzle();
    await drizzle.delete(spans).where(eq(spans.id, id));
  }

  // Utility methods
  async getTraceWithSpans(traceId: string): Promise<{ trace: TraceData; spans: SpanData[] } | undefined> {
    const trace = await this.getTraceById(traceId);
    if (!trace) return undefined;
    
    const spansResult = await this.getSpansByTraceId(traceId);
    
    return { trace, spans: spansResult.spans };
  }

  async clearProjectTraces(projectId: string): Promise<void> {
    const drizzle = await db.getDrizzle();
    await drizzle.delete(traces).where(eq(traces.projectId, projectId));
  }
}