# One Logger CLI

A powerful logging solution for developers that provides comprehensive logging, tracing, and monitoring capabilities.

## Installation

### Using npx (Recommended)

```bash
npx one-logger-cli
```

### Global Installation

```bash
npm install -g one-logger-cli
# or
yarn global add one-logger-cli
# or
pnpm add -g one-logger-cli
```

## Usage

### Quick Start

Start One Logger with a single command:

```bash
# Using npx
npx one-logger-cli

# Or if installed globally
one-logger
```

This will:
- Start the API server on port 3001
- Start the web UI on port 5173
- Start the MCP server (if configured)
- Automatically open the web UI in your browser

### Available Commands

```bash
# Start all services (default behavior)
one-logger
one-logger start

# Stop all services
one-logger stop

# Open web UI in browser
one-logger open

# Show help
one-logger --help
```

### Access Points

Once running, you can access:

- **Web UI**: http://localhost:5173
- **API**: http://localhost:3001/api
- **API Documentation**: http://localhost:3001/ui

## Features

- 🚀 **Simple Setup**: Start everything with one command
- 🌐 **Web Interface**: Modern, intuitive web UI for log management
- 📡 **REST API**: Full-featured API for programmatic access
- 🔍 **Log Tracing**: Advanced tracing capabilities
- 📊 **Monitoring**: Real-time monitoring and analytics
- 🔌 **MCP Integration**: Model Context Protocol support
- 📚 **Auto Documentation**: Interactive API documentation

## Requirements

- Node.js >= 18.0.0

## Development

For development and contributing:

```bash
# Clone the repository
git clone https://github.com/your-username/one-logger.git
cd one-logger/apps/cli-app

# Install dependencies
pnpm install

# Build the project
pnpm build

# Run in development mode
pnpm dev
```

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- [GitHub Issues](https://github.com/your-username/one-logger/issues)
- [Documentation](https://github.com/your-username/one-logger#readme)