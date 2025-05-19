# logs-hunter

**This logger package is designed to be used with the [Log Hunter Electron app](https://github.com/stormsidali2001/log-hunter).**

A modular TypeScript logger for Node.js and browser environments.

## Installation

```sh
pnpm add logs-hunter
```

## Usage

```ts
import { Logger, initializeLogger, HttpLoggerTransport } from 'logs-hunter';

const transport = new HttpLoggerTransport('https://your-api-endpoint/logs');
const logger = new Logger({ projectId: 'your-project-id', transport });

logger.info('Hello from logs-hunter!');
```

## Features
- Modular and extensible
- TypeScript-first, no `any` types
- HTTP transport included

## License
ISC 