# logs-hunter

**This logger package is designed to be used with the [Log Hunter Electron app](https://github.com/stormsidali2001/log-hunter).**

A modular TypeScript logger for Node.js and browser environments.

## Installation

```sh
pnpm add logs-hunter
```

## Usage

```ts
import { initializeLogger } from 'logs-hunter';

const logger = await initializeLogger({
  projectName: 'your-project-name',
  projectDescription: 'A description of your project',
});

logger.info('Hello from logs-hunter!');
```

## Features
- Modular and extensible
- TypeScript-first, no `any` types
- HTTP transport included

## License
MIT 