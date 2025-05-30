import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Minimal config table for storing key-value pairs
export const config = sqliteTable('config', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  createdAt: text('created_at').notNull(), // ISO string
  config: text('config').notNull().default('{}'), // JSON string for project-specific configuration
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
  embeddedMetadata: text('embedded_metadata').notNull().default('{}'), // JSON string for non-tracked metadata
});

// Define relations for logs
export const logsRelations = relations(logs, ({ one, many }) => ({
  project: one(projects, {
    fields: [logs.projectId],
    references: [projects.id],
  }),
  metadata: many(logMetadata),
}));

// Table for tracked log metadata with key-value pairs (only for metadata keys marked as tracked in project config)
export const logMetadata = sqliteTable('log_metadata', {
  id: text('id').primaryKey(),
  logId: text('log_id').notNull().references(() => logs.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  value: text('value').notNull(),
}, (table) => ({
  logIdIdx: index('log_metadata_log_id_idx').on(table.logId),
  keyIdx: index('log_metadata_key_idx').on(table.key),
  valueIdx: index('log_metadata_value_idx').on(table.value),
}));

// Define relations for logMetadata
export const logMetadataRelations = relations(logMetadata, ({ one }) => ({
  log: one(logs, {
    fields: [logMetadata.logId],
    references: [logs.id],
  }),
}));
