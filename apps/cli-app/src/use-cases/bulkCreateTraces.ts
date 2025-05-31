import { TraceRepository } from '../repositories/traceRepository.js';
import { CreateTraceData, TraceData } from '../types/trace.js';

export class BulkCreateTraces {
  constructor(private traceRepository: TraceRepository) {}

  async execute(tracesData: CreateTraceData[]): Promise<TraceData[]> {
    if (!tracesData || tracesData.length === 0) {
      throw new Error('No trace data provided');
    }

    // Validate each trace data
    for (const traceData of tracesData) {
      if (!traceData.projectId || !traceData.name || !traceData.startTime) {
        throw new Error('Missing required fields in trace data: projectId, name, startTime');
      }
    }

    return await this.traceRepository.bulkTraceInsert(tracesData);
  }
}