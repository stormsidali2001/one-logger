import { defineConfig } from "drizzle-kit";
import { resolve } from "path";
import { homedir } from "os";
import path from "path";

// Use the same database path as the application
const userDataPath = path.join(homedir(), '.one-logger');
const dbDir = path.join(userDataPath, 'database');
const dbPath = path.join(dbDir, 'projects-database');

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "turso",
  dbCredentials: {
    url: `file:${dbPath}`,
  },
  verbose: true,
  strict: true,
});

