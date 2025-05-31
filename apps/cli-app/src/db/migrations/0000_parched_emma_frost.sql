CREATE TABLE `config` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `log_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`log_id` text NOT NULL,
	`metadata_id` text NOT NULL,
	FOREIGN KEY (`log_id`) REFERENCES `logs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`metadata_id`) REFERENCES `metadata`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`level` text NOT NULL,
	`message` text NOT NULL,
	`timestamp` text NOT NULL,
	`embedded_metadata` text DEFAULT '{}' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `metadata_key_idx` ON `metadata` (`key`);--> statement-breakpoint
CREATE INDEX `metadata_value_idx` ON `metadata` (`value`);--> statement-breakpoint
CREATE INDEX `metadata_project_id_idx` ON `metadata` (`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `metadata_key_value_project_unique` ON `metadata` (`key`,`value`,`project_id`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text NOT NULL,
	`config` text DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_name_unique` ON `projects` (`name`);--> statement-breakpoint
CREATE TABLE `spans` (
	`id` text PRIMARY KEY NOT NULL,
	`trace_id` text NOT NULL,
	`parent_span_id` text,
	`name` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text,
	`duration` text,
	`status` text DEFAULT 'running' NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`trace_id`) REFERENCES `traces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `spans_trace_id_idx` ON `spans` (`trace_id`);--> statement-breakpoint
CREATE INDEX `spans_parent_span_id_idx` ON `spans` (`parent_span_id`);--> statement-breakpoint
CREATE INDEX `spans_status_idx` ON `spans` (`status`);--> statement-breakpoint
CREATE INDEX `spans_start_time_idx` ON `spans` (`start_time`);--> statement-breakpoint
CREATE TABLE `traces` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text,
	`duration` text,
	`status` text DEFAULT 'running' NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `traces_project_id_idx` ON `traces` (`project_id`);--> statement-breakpoint
CREATE INDEX `traces_status_idx` ON `traces` (`status`);--> statement-breakpoint
CREATE INDEX `traces_start_time_idx` ON `traces` (`start_time`);