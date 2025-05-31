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
  config: text('config').notNull().default('{}'), // JSON string for project-specific configuration
});

// Define relations for projects
export const projectsRelations = relations(projects, ({ many }) => ({
  logs: many(logs),
  traces: many(traces),
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
  logMetadata: many(logMetadata),
}));

// Table for metadata definitions (key-value pairs that can be reused across logs)
export const metadata = sqliteTable('metadata', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  value: text('value').notNull(),
}, 
(table) => ([
   index('metadata_key_idx').on(table.key),
   index('metadata_value_idx').on(table.value),
   index('metadata_project_id_idx').on(table.projectId),
   unique('metadata_key_value_project_unique').on(table.key, table.value, table.projectId),
])

);

// Bridge table for log-metadata associations (many-to-many relationship)
export const logMetadata = sqliteTable('log_metadata', {
  id: text('id').primaryKey(),
  logId: text('log_id').notNull().references(() => logs.id, { onDelete: 'cascade' }),
  metadataId: text('metadata_id').notNull().references(() => metadata.id, { onDelete: 'cascade' }),
});

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

// Traces table for storing trace information
export const traces = sqliteTable('traces', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  startTime: text('start_time').notNull(), // ISO string
  endTime: text('end_time'), // ISO string, nullable for ongoing traces
  duration: text('duration'), // Duration in milliseconds, nullable for ongoing traces
  status: text('status').notNull().default('running'), // 'running', 'completed', 'failed'
  metadata: text('metadata').notNull().default('{}'), // JSON string for trace metadata
  createdAt: text('created_at').notNull(), // ISO string
}, (table) => ([
  index('traces_project_id_idx').on(table.projectId),
  index('traces_status_idx').on(table.status),
  index('traces_start_time_idx').on(table.startTime),
]));

// Spans table for storing span information within traces
export const spans = sqliteTable('spans', {
  id: text('id').primaryKey(),
  traceId: text('trace_id').notNull().references(() => traces.id, { onDelete: 'cascade' }),
  parentSpanId: text('parent_span_id'), // Self-reference for nested spans
  name: text('name').notNull(),
  startTime: text('start_time').notNull(), // ISO string
  endTime: text('end_time'), // ISO string, nullable for ongoing spans
  duration: text('duration'), // Duration in milliseconds, nullable for ongoing spans
  status: text('status').notNull().default('running'), // 'running', 'completed', 'failed'
  metadata: text('metadata').notNull().default('{}'), // JSON string for span metadata
  createdAt: text('created_at').notNull(), // ISO string
}, (table) => 
[
index('spans_trace_id_idx').on(table.traceId),
index('spans_parent_span_id_idx').on(table.parentSpanId),
index('spans_status_idx').on(table.status),
index('spans_start_time_idx').on(table.startTime)
]

);

// Define relations for traces
export const tracesRelations = relations(traces, ({ one, many }) => ({
  project: one(projects, {
    fields: [traces.projectId],
    references: [projects.id],
  }),
  spans: many(spans),
}));

// Define relations for spans
export const spansRelations = relations(spans, ({ one, many }) => ({
  trace: one(traces, {
    fields: [spans.traceId],
    references: [traces.id],
  }),
  parentSpan: one(spans, {
    fields: [spans.parentSpanId],
    references: [spans.id],
  }),
  childSpans: many(spans),
}));
