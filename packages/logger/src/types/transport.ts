import { LogCreate } from './log';

export interface LoggerTransport {
  send(payload: LogCreate): Promise<void>;
} 