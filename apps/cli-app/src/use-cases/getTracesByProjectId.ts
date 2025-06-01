import { TraceRepository } from '../repositories/traceRepository.js';
import { TraceData, TraceQueryOptions } from '../types/trace.js';

export class GetTracesByProjectId {
  private traceRepository: TraceRepository;

  constructor(traceRepository: TraceRepository) {
    this.traceRepository = traceRepository;
  }

  async execute(projectId: string, options: TraceQueryOptions = {}): Promise<{ traces: TraceData[]; hasNextPage: boolean }> {
    return await this.traceRepository.getTracesByProjectId(projectId, options);
  }
}