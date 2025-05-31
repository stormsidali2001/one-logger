import { TraceRepository } from '../repositories/traceRepository.js';
import { CreateSpanData, SpanData } from '../types/trace.js';

export class CreateSpan {
  private traceRepository: TraceRepository;

  constructor(traceRepository: TraceRepository) {
    this.traceRepository = traceRepository;
  }

  async execute(data: CreateSpanData): Promise<SpanData> {
    return await this.traceRepository.createSpan(data);
  }
}