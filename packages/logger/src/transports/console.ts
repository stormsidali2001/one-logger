import { LoggerTransport, LogCreate } from '../types';

export class ConsoleLoggerTransport implements LoggerTransport {
  async send(payload: LogCreate): Promise<void> {
    const { level, message, metadata = [], timestamp } = payload;
    
    // Format metadata for display
    const metaString = metadata.length > 0 
      ? ` | ${metadata.map(m => `${m.key}=${m.value}`).join(', ')}`
      : '';
    
    // Format the log message
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
    
    // Output to appropriate console method based on level
    switch (level.toLowerCase()) {
      case 'debug':
        console.debug(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
        break;
    }
  }
}