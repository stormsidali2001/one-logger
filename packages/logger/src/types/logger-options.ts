import { LoggerTransport } from './transport';

export interface LoggerOptions {
  projectId: string;
  transport: LoggerTransport;
} 