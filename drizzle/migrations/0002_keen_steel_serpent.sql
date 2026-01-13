ALTER TABLE `events` ADD `recurrence_end_date` integer;--> statement-breakpoint
ALTER TABLE `events` ADD `exclude_dates` text;--> statement-breakpoint
ALTER TABLE `events` ADD `occurrence_date` integer;--> statement-breakpoint
ALTER TABLE `events` ADD `mec_post_id` integer;--> statement-breakpoint
ALTER TABLE `events` ADD `mec_source_url` text;--> statement-breakpoint
CREATE INDEX `events_parent_event_idx` ON `events` (`parent_event_id`);--> statement-breakpoint
CREATE INDEX `events_mec_post_idx` ON `events` (`mec_post_id`);