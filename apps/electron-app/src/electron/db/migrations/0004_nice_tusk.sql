CREATE TABLE `log_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`log_id` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`log_id`) REFERENCES `logs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `logs` DROP COLUMN `meta`;