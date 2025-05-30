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
CREATE UNIQUE INDEX `projects_name_unique` ON `projects` (`name`);