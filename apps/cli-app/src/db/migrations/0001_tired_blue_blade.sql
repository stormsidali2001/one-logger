ALTER TABLE `logs` ADD `embedded_metadata` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `config` text DEFAULT '{}' NOT NULL;