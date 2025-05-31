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
	FOREIGN KEY (`trace_id`) REFERENCES `traces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_span_id`) REFERENCES `spans`(`id`) ON UPDATE no action ON DELETE cascade
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