CREATE TABLE `subscription_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`channel` text NOT NULL,
	`contact` text NOT NULL,
	`topics` text NOT NULL,
	`status` text DEFAULT 'pending_setup' NOT NULL,
	`consent_version` text NOT NULL,
	`created_at` text NOT NULL,
	`cancel_token_hash` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_subscriptions_cancel_token` ON `subscriptions` (`cancel_token_hash`);