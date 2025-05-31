import { TraceRepository } from '../repositories/traceRepository.js';
import { SpanData } from '../types/trace.js';

export class GetSpansByTraceId {
  private traceRepository: TraceRepository;

  constructor(traceRepository: TraceRepository) {
    this.traceRepository = traceRepository;
  }

  async execute(traceId: string, options: {
    limit?: number;
    offset?: number;
    sortDirection?: 'asc' | 'desc';
  } = {}): Promise<SpanData[]> {
    return await this.traceRepository.getSpansByTraceId(traceId, options);
  }
}