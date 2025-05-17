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

export const logs = sqliteTable('logs', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  level: text('level').notNull(),
  message: text('message').notNull(),
  timestamp: text('timestamp').notNull(),
  meta: text('meta', { mode: 'json' }).notNull(),
});
