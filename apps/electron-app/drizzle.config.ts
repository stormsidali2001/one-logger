import { defineConfig } from "drizzle-kit";
import { resolve } from "path";

export default defineConfig({
  schema: "./src/electron/db/schema.ts",
  out: "./src/electron/db/migrations",
  dialect: "turso",
  dbCredentials: {
    url: `file:${resolve(process.cwd(), "data/life-os.db")}`,
  },
  verbose: true,
  strict: true,
});

