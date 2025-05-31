import { TraceRepository } from '../repositories/traceRepository.js';
import { TraceData } from '../types/trace.js';

export class GetTracesByProjectId {
  private traceRepository: TraceRepository;

  constructor(traceRepository: TraceRepository) {
    this.traceRepository = traceRepository;
  }

  async execute(projectId: string, options: {
    limit?: number;
    offset?: number;
    sortDirection?: 'asc' | 'desc';
  } = {}): Promise<TraceData[]> {
    return await this.traceRepository.getTracesByProjectId(projectId, options);
  }
}