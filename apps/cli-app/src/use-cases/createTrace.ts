import { TraceRepository } from '../repositories/traceRepository.js';
import { CreateTraceData, TraceData } from '../types/trace.js';

export class CreateTrace {
  private traceRepository: TraceRepository;

  constructor(traceRepository: TraceRepository) {
    this.traceRepository = traceRepository;
  }

  async execute(data: CreateTraceData): Promise<TraceData> {
    return await this.traceRepository.createTrace(data);
  }
}