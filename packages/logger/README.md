# logs-collector

**This logger package is designed to be used with the [Log Hunter Electron app](https://github.com/stormsidali2001/log-hunter).**

A modular TypeScript logger for Node.js and browser environments.

## Installation

```sh
pnpm add logs-collector
```

## Usage

```ts
import { logger, initializeLogger } from 'logs-collector';

// Call this once at app startup (async)
await initializeLogger({
  name: 'your-project-name',
  description: 'A description of your project',
});

// Use logger anywhere, synchronously
logger.info('Hello from logs-collector!');
```

## Features
- Modular and extensible
- TypeScript-first, no `any` types
- HTTP transport included
- Singleton logger instance for easy use

## License
MIT 