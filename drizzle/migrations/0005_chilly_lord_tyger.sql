CREATE INDEX `certifications_member_id_idx` ON `certifications` (`member_id`);--> statement-breakpoint
CREATE INDEX `certifications_expires_at_idx` ON `certifications` (`expires_at`);--> statement-breakpoint
CREATE INDEX `guests_created_by_idx` ON `guests` (`created_by_member_id`);--> statement-breakpoint
CREATE INDEX `guests_member_email_idx` ON `guests` (`created_by_member_id`,`email`);