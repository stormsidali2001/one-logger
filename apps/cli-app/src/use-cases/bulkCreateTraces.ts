import { TraceRepository } from '../repositories/traceRepository.js';
import { ProjectRepository } from '../repositories/projectRepository.js';
import { CreateTraceData, TraceData } from '../types/trace.js';

export class BulkCreateTraces {
  constructor(
    private traceRepository: TraceRepository,
    private projectRepository: ProjectRepository
  ) {}

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

    // Validate that all referenced projects exist
    const uniqueProjectIds = [...new Set(tracesData.map(trace => trace.projectId))];
    for (const projectId of uniqueProjectIds) {
      const project = await this.projectRepository.getProjectById(projectId);
      if (!project) {
        throw new Error(`Project with ID '${projectId}' does not exist. Please create the project first before adding traces.`);
      }
    }

    return await this.traceRepository.bulkTraceInsert(tracesData);
  }
}