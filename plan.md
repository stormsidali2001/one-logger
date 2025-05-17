# Monorepo Logging System Plan

## Overview
Build a modular logging system in a monorepo. The system will include:
- An Electron app for log collection, project management, and visualization.
- A logging library package with a console-like API that sends logs to the Electron app via HTTP (local only), compatible with both Node.js and browser environments.

---

## 1. Electron App: Project Management
- **Goal:** Allow creation and management of projects. Each log is associated with a project.
- **Steps:**
  - Design a `Project` entity (id, name, description, createdAt, etc.)
  - Implement CRUD UI for projects in the Electron app.
  - Store projects in SQLite via Drizzle ORM.
  - Expose project management endpoints (optional, for local management).

## 2. Electron App: HTTP Log Server
- **Goal:** Accept logs via HTTP POST requests from the logging library (local only).
- **Steps:**
  - Integrate a lightweight HTTP server (e.g., Express, Fastify, or native Node.js HTTP) in the Electron main process.
  - Define a `/logs` endpoint to receive log entries (projectId, level, message, timestamp, meta, etc.).
  - Validate and store incoming logs in SQLite (Drizzle ORM).

## 3. Logging Library Package
- **Goal:** Provide a drop-in logging library with a console-like API that sends logs to the Electron app, and works in both Node.js and browser environments.
- **Steps:**
  - Create a new package (e.g., `@one-logger/logger`) in `packages/`.
  - Design an API: `log`, `info`, `warn`, `error`, etc., matching the console API.
  - Ensure compatibility with both Node.js and browser environments for sending HTTP requests.
  - Allow initialization with a project identifier and Electron app HTTP endpoint (local only).
  - Send logs as HTTP POST requests to the Electron app.
  - Ensure type safety (no `any`), modularity, and extensibility.

## 4. Type Safety & Modularity
- **Goal:** Ensure all code is type-safe and modular.
- **Steps:**
  - Use TypeScript throughout (no `any`).
  - Define shared types/interfaces in a `@one-logger/types` package if needed.
  - Keep Electron app, logger library, and types decoupled and reusable.

## 5. Future Enhancements
- **Log querying and visualization** in the Electron app.
- **Real-time log streaming** to the UI.
- **Authentication and access control** for log endpoints.

---

## Next Steps
1. Implement project management in the Electron app.
2. Add an HTTP server to the Electron app for log ingestion.
3. Scaffold the logging library package.
4. Define and share types/interfaces. 