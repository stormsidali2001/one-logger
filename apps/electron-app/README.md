# Electron + shadcn/ui + Drizzle (SQLite) + TanStack Router + React Query Starter Kit

**Location:** `apps/electron-app`

This app is now part of a monorepo. Dependency management is handled at the root using `pnpm` workspaces. Please do not run `pnpm install` inside this directory; instead, run it from the monorepo root.

---

## Features

- **Electron** for cross-platform desktop apps
- **Vite** for fast React development
- **shadcn/ui** for beautiful, accessible UI components
- **Drizzle ORM** with **SQLite** for local database
- **TanStack Router** for type-safe routing
- **React Query** for data fetching and caching
- **TypeScript-first, ready for extension**

---

## Project Structure

```
src/
  components/
    dashboard/         # Dashboard and config demo
    layout/            # App layout and sidebar
    ui/                # shadcn/ui components
  electron/
    db/                # Drizzle schema, db setup
    ipc/               # Electron IPC handlers
    main.ts            # Electron main process
    preload.cts        # Electron preload script
  hooks/
    queries/           # React Query hooks and query keys
  pages/               # About, Settings, Help pages
  routes/              # TanStack Router config
  assets/              # Static assets
  App.tsx              # App entry
  main.tsx             # Vite/React entry
```

---

## Usage in Monorepo

- Install all dependencies from the monorepo root:
   ```sh
   pnpm install
   ```
- Start the Electron app in development:
   ```sh
  pnpm --filter electron-app dev
   ```
- Build for production:
   ```sh
  pnpm --filter electron-app build
  pnpm --filter electron-app electron:build
   ```

---

## Demo

- **Dashboard:** Minimal config demo (read/write key-value pairs to SQLite)
- **Sidebar:** Navigation to Dashboard, About, Settings, Help
- **Pages:** Empty About, Settings, Help pages for easy extension

---

## Stack

- [Electron](https://www.electronjs.org/)
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/) + [SQLite](https://www.sqlite.org/)
- [TanStack Router](https://tanstack.com/router/latest)
- [React Query](https://tanstack.com/query/latest)
- [TypeScript](https://www.typescriptlang.org/)

---

## License

MIT
