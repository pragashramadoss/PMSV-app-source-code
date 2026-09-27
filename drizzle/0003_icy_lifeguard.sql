CREATE TABLE `push_devices` (
	`id` text PRIMARY KEY NOT NULL,
	`endpoint` text NOT NULL,
	`token_hash` text NOT NULL,
	`seen_at` integer NOT NULL,
	`retry_at` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_push_due` ON `push_devices` (`seen_at`,`retry_at`);--> statement-breakpoint
CREATE TABLE `push_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
