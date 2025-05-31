import { TraceRepository } from '../repositories/traceRepository.js';
import { UpdateSpanData, SpanData } from '../types/trace.js';

export class UpdateSpan {
  private traceRepository: TraceRepository;

  constructor(traceRepository: TraceRepository) {
    this.traceRepository = traceRepository;
  }

  async execute(id: string, data: UpdateSpanData): Promise<SpanData | undefined> {
    return await this.traceRepository.updateSpan(id, data);
  }
}