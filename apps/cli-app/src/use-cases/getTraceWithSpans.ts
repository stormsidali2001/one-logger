import { TraceRepository } from '../repositories/traceRepository.js';
import { TraceData, SpanData } from '../types/trace.js';

export class GetTraceWithSpans {
  private traceRepository: TraceRepository;

  constructor(traceRepository: TraceRepository) {
    this.traceRepository = traceRepository;
  }

  async execute(traceId: string): Promise<{ trace: TraceData; spans: SpanData[] } | undefined> {
    return await this.traceRepository.getTraceWithSpans(traceId);
  }
}