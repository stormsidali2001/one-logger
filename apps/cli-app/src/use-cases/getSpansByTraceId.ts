import { TraceRepository } from '../repositories/traceRepository.js';
import { SpanData, SpanQueryOptions } from '../types/trace.js';

export class GetSpansByTraceId {
  private traceRepository: TraceRepository;

  constructor(traceRepository: TraceRepository) {
    this.traceRepository = traceRepository;
  }

  async execute(traceId: string, options: SpanQueryOptions = {}): Promise<{ spans: SpanData[]; hasNextPage: boolean }> {
    return await this.traceRepository.getSpansByTraceId(traceId, options);
  }
}