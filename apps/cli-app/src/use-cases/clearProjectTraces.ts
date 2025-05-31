import { TraceRepository } from '../repositories/traceRepository.js';

export class ClearProjectTraces {
  private traceRepository: TraceRepository;

  constructor(traceRepository: TraceRepository) {
    this.traceRepository = traceRepository;
  }

  async execute(projectId: string): Promise<void> {
    await this.traceRepository.clearProjectTraces(projectId);
  }
}