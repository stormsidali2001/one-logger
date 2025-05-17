import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Minimal config table for storing key-value pairs
export const config = sqliteTable('config', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  createdAt: text('created_at').notNull(), // ISO string
});

// Define relations for projects
export const projectsRelations = relations(projects, ({ many }) => ({
  logs: many(logs),
}));

export const logs = sqliteTable('logs', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  level: text('level').notNull(),
  message: text('message').notNull(),
  timestamp: text('timestamp').notNull(),
  // meta field removed and moved to separate table
});

// Define relations for logs
export const logsRelations = relations(logs, ({ one, many }) => ({
  project: one(projects, {
    fields: [logs.projectId],
    references: [projects.id],
  }),
  metadata: many(logMetadata),
}));

// New table for log metadata with key-value pairs
export const logMetadata = sqliteTable('log_metadata', {
  id: text('id').primaryKey(),
  logId: text('log_id').notNull().references(() => logs.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  value: text('value').notNull(),
});

// Define relations for logMetadata
export const logMetadataRelations = relations(logMetadata, ({ one }) => ({
  log: one(logs, {
    fields: [logMetadata.logId],
    references: [logs.id],
  }),
}));
