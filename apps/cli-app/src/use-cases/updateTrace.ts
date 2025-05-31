import { TraceRepository } from '../repositories/traceRepository.js';
import { UpdateTraceData, TraceData } from '../types/trace.js';

export class UpdateTrace {
  private traceRepository: TraceRepository;

  constructor(traceRepository: TraceRepository) {
    this.traceRepository = traceRepository;
  }

  async execute(id: string, data: UpdateTraceData): Promise<TraceData | undefined> {
    return await this.traceRepository.updateTrace(id, data);
  }
}