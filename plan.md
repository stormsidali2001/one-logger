# Migration Plan: Electron App to CLI App with Vite Web Server

## Overview
This document outlines the migration strategy for refactoring the current Electron application into a CLI application that spawns a Vite web server for the UI.

## Current Architecture
- **Electron App**: Desktop application with main process and renderer process
- **Backend**: Hono server with SQLite database
- **Frontend**: React components with Electron IPC communication
- **Data Layer**: Repositories for Projects, Logs, and Config
- **Use Cases**: Clean architecture with dedicated use case classes

## Target Architecture
- **CLI App**: Node.js CLI application
- **Web Server**: Vite development server serving React UI
- **Backend**: Standalone Hono server
- **Communication**: HTTP API instead of IPC
- **Database**: Same SQLite database structure

## Migration Phases

### Phase 1: CLI Structure Setup
1. Create CLI entry point
2. Set up command structure using a CLI framework (Commander.js)
3. Implement basic commands (start, stop, status)

### Phase 2: Backend Extraction
1. Extract server logic from Electron context
2. Make server standalone and configurable
3. Update repositories to work outside Electron
4. Ensure database initialization works in CLI context

### Phase 3: Frontend Migration
1. Move React components to Vite app
2. Replace IPC calls with HTTP API calls
3. Update state management for HTTP communication
4. Implement proper error handling for network requests

### Phase 4: Integration
1. CLI spawns Vite server automatically
2. Configure proper ports and URLs
3. Implement graceful shutdown
4. Add development vs production modes

## Detailed Implementation Steps

### 1. CLI Application Structure
```
apps/cli-app/
├── src/
│   ├── commands/
│   │   ├── start.ts
│   │   ├── stop.ts
│   │   └── status.ts
│   ├── server/
│   │   ├── server.ts (extracted from electron)
│   │   └── serverManager.ts
│   ├── db/
│   │   └── db.ts (extracted from electron)
│   ├── repositories/
│   │   └── *.ts (extracted from electron)
│   ├── use-cases/
│   │   └── *.ts (extracted from electron)
│   └── cli.ts (main entry point)
├── package.json
└── tsconfig.json
```

### 2. Components to Extract from Electron
- **Database Layer**: `src/electron/db/`
- **Repositories**: `src/electron/repositories/`
- **Use Cases**: `src/electron/use-cases/`
- **Server Logic**: `src/electron/server/`
- **MCP Server**: `src/electron/mcpServer/`

### 3. Frontend Migration to Vite
- **Components**: Move from `src/components/` to vite app
- **Pages**: Move from `src/pages/` to vite app
- **Hooks**: Update to use HTTP instead of IPC
- **Providers**: Replace Electron context with HTTP client
- **Types**: Share types between CLI and web app

### 4. API Communication Changes
```typescript
// Before (IPC)
const projects = await window.electronAPI.getAllProjects();

// After (HTTP)
const projects = await fetch('/api/projects').then(r => r.json());
```

### 5. CLI Commands
```bash
# Start the application (server + web UI)
one-logger start

# Start only the server
one-logger start --server-only

# Stop the application
one-logger stop

# Check status
one-logger status

# Open web UI in browser
one-logger open
```

### 6. Configuration Management
- Move config from Electron's userData to standard config locations
- Support environment variables
- CLI flags for overriding config

## Migration Priority

### High Priority (Core Functionality)
1. ✅ Extract database and repositories
2. ✅ Extract use cases
3. ✅ Extract server logic
4. 🔄 Create CLI structure
5. 🔄 Implement basic CLI commands

### Medium Priority (UI Migration)
6. 🔄 Move React components to Vite
7. 🔄 Replace IPC with HTTP calls
8. 🔄 Update state management

### Low Priority (Polish)
9. 🔄 Add CLI help and documentation
10. 🔄 Implement proper logging
11. 🔄 Add configuration validation
12. 🔄 Package as distributable CLI

## Benefits of New Architecture

### Development Benefits
- **Faster Development**: Vite's hot reload vs Electron's slower reload
- **Better Debugging**: Standard web dev tools
- **Easier Testing**: HTTP APIs are easier to test than IPC

### Deployment Benefits
- **Lighter Weight**: No Electron overhead
- **Cross-Platform**: CLI works on any Node.js environment
- **Remote Access**: Web UI can be accessed remotely

### Maintenance Benefits
- **Simpler Architecture**: Standard web app + CLI
- **Better Separation**: Clear API boundaries
- **Easier Updates**: Independent frontend/backend updates

## Potential Challenges

### Technical Challenges
1. **File System Access**: CLI needs proper permissions
2. **Process Management**: Managing server lifecycle
3. **Port Conflicts**: Handling port availability
4. **Database Location**: Consistent database path across environments

### Migration Challenges
1. **Data Migration**: Ensuring existing data works
2. **Configuration Migration**: Moving Electron config to CLI config
3. **User Experience**: Maintaining familiar workflows

## Next Steps

1. **Create CLI App Structure**: Set up basic CLI framework
2. **Extract Backend Components**: Move server logic to CLI app
3. **Update Vite App**: Prepare frontend for HTTP communication
4. **Implement CLI Commands**: Basic start/stop functionality
5. **Test Integration**: Ensure everything works together
6. **Documentation**: Update README and user guides

## Success Criteria

- [ ] CLI can start/stop the application
- [ ] Web UI loads and functions correctly
- [ ] All existing features work via HTTP API
- [ ] Database operations work in CLI context
- [ ] MCP server integration works
- [ ] Development experience is improved

---

*This migration plan will be updated as we progress through the implementation.*