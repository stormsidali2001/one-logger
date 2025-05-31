import { db, Drizzle, DrizzleTransaction } from '../db/db.js';
import { traces, spans } from '../db/schema.js';
import { eq, and, desc, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import {
  TraceData,
  SpanData,
  CreateTraceData,
  CreateSpanData,
  UpdateTraceData,
  UpdateSpanData
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

  async getTracesByProjectId(projectId: string, options: {
    limit?: number;
    offset?: number;
    sortDirection?: 'asc' | 'desc';
  } = {}): Promise<TraceData[]> {
    const drizzle = await db.getDrizzle();
    const { limit = 50, offset = 0, sortDirection = 'desc' } = options;
    
    const orderBy = sortDirection === 'desc' ? desc(traces.startTime) : asc(traces.startTime);
    
    const results = await drizzle
      .select()
      .from(traces)
      .where(eq(traces.projectId, projectId))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)
      .all();
    
    return results.map(result => ({
      id: result.id,
      projectId: result.projectId,
      name: result.name,
      startTime: result.startTime,
      endTime: result.endTime || undefined,
      duration: result.duration || undefined,
      status: result.status as 'running' | 'completed' | 'failed',
      metadata: JSON.parse(result.metadata),
      createdAt: result.createdAt,
    }));
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
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    
    const spanData = {
      id,
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

  async getSpansByTraceId(traceId: string, options: {
    limit?: number;
    offset?: number;
    sortDirection?: 'asc' | 'desc';
  } = {}): Promise<SpanData[]> {
    const drizzle = await db.getDrizzle();
    const { limit = 100, offset = 0, sortDirection = 'asc' } = options;
    
    const orderBy = sortDirection === 'desc' ? desc(spans.startTime) : asc(spans.startTime);
    
    const results = await drizzle
      .select()
      .from(spans)
      .where(eq(spans.traceId, traceId))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)
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
    
    const spans = await this.getSpansByTraceId(traceId);
    
    return { trace, spans };
  }

  async clearProjectTraces(projectId: string): Promise<void> {
    const drizzle = await db.getDrizzle();
    await drizzle.delete(traces).where(eq(traces.projectId, projectId));
  }
}