import { sqliteTable, text, index, unique } from 'drizzle-orm/sqlite-core';
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
  logMetadata: many(logMetadata),
}));

// Table for metadata definitions (key-value pairs that can be reused across logs)
export const metadata = sqliteTable('metadata', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  value: text('value').notNull(),
}, (table) => ({
  keyIdx: index('metadata_key_idx').on(table.key),
  valueIdx: index('metadata_value_idx').on(table.value),
  projectIdIdx: index('metadata_project_id_idx').on(table.projectId),
  uniqueKeyValueProject: unique('metadata_key_value_project_unique').on(table.key, table.value, table.projectId),
}));

// Bridge table for log-metadata associations (many-to-many relationship)
export const logMetadata = sqliteTable('log_metadata', {
  id: text('id').primaryKey(),
  logId: text('log_id').notNull().references(() => logs.id, { onDelete: 'cascade' }),
  metadataId: text('metadata_id').notNull().references(() => metadata.id, { onDelete: 'cascade' }),
}, (table) => ({
  logIdIdx: index('log_metadata_log_id_idx').on(table.logId),
  metadataIdIdx: index('log_metadata_metadata_id_idx').on(table.metadataId),
  uniqueLogMetadata: unique('log_metadata_unique').on(table.logId, table.metadataId),
}));

// Define relations for metadata
export const metadataRelations = relations(metadata, ({ one, many }) => ({
  project: one(projects, {
    fields: [metadata.projectId],
    references: [projects.id],
  }),
  logMetadata: many(logMetadata),
}));

// Define relations for logMetadata bridge table
export const logMetadataRelations = relations(logMetadata, ({ one }) => ({
  log: one(logs, {
    fields: [logMetadata.logId],
    references: [logs.id],
  }),
  metadata: one(metadata, {
    fields: [logMetadata.metadataId],
    references: [metadata.id],
  }),
}));
