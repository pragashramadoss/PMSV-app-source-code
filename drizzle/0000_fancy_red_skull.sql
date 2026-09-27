CREATE TABLE `editions` (
	`id` text PRIMARY KEY NOT NULL,
	`imported_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `news_archive` (
	`id` text PRIMARY KEY NOT NULL,
	`tab` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`published` text NOT NULL,
	`category` text NOT NULL,
	`source` text NOT NULL,
	`url` text NOT NULL,
	`source_type` text NOT NULL,
	`first_seen` text NOT NULL,
	`verified_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_news_tab_date` ON `news_archive` (`tab`,`published`);