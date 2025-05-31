import { TraceRepository } from '../repositories/traceRepository.js';
import { TraceData } from '../types/trace.js';

export class GetTraceById {
  private traceRepository: TraceRepository;

  constructor(traceRepository: TraceRepository) {
    this.traceRepository = traceRepository;
  }

  async execute(id: string): Promise<TraceData | undefined> {
    return await this.traceRepository.getTraceById(id);
  }
}