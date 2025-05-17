CREATE TABLE `logs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`level` text NOT NULL,
	`message` text NOT NULL,
	`timestamp` text NOT NULL,
	`meta` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
