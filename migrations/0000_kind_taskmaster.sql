CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`id_token` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`announcement_type` text NOT NULL,
	`publish_at` integer,
	`expires_at` integer,
	`is_pinned` integer DEFAULT false,
	`send_email` integer DEFAULT false,
	`send_sms` integer DEFAULT false,
	`email_sent_at` integer,
	`sms_sent_at` integer,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `announcements_publish_at_idx` ON `announcements` (`publish_at`);--> statement-breakpoint
CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`membership_type` text NOT NULL,
	`how_heard_about_us` text,
	`utm_source` text,
	`utm_medium` text,
	`utm_campaign` text,
	`government_id_url` text,
	`background_consent_url` text,
	`veteran_doc_url` text,
	`has_texas_ltc` integer DEFAULT false,
	`ltc_number` text,
	`ltc_verified_at` integer,
	`stripe_payment_intent_id` text,
	`amount_paid` integer,
	`paid_at` integer,
	`safety_eval_event_id` text,
	`safety_eval_date` integer,
	`safety_eval_result` text,
	`safety_eval_notes` text,
	`safety_eval_by` text,
	`orientation_event_id` text,
	`orientation_date` integer,
	`orientation_completed` integer DEFAULT false,
	`vote_meeting_date` integer,
	`votes_for` integer,
	`votes_against` integer,
	`votes_abstain` integer,
	`approved_at` integer,
	`approved_by` text,
	`rejected_at` integer,
	`rejected_by` text,
	`rejection_reason` text,
	`expires_at` integer,
	`resume_token` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`safety_eval_event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`safety_eval_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`orientation_event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`approved_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`rejected_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `applications_resume_token_unique` ON `applications` (`resume_token`);--> statement-breakpoint
CREATE INDEX `applications_status_idx` ON `applications` (`status`);--> statement-breakpoint
CREATE INDEX `applications_user_id_idx` ON `applications` (`user_id`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`target_type` text,
	`target_id` text,
	`details` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_log_user_id_idx` ON `audit_log` (`user_id`);--> statement-breakpoint
CREATE INDEX `audit_log_target_idx` ON `audit_log` (`target_type`,`target_id`);--> statement-breakpoint
CREATE INDEX `audit_log_created_at_idx` ON `audit_log` (`created_at`);--> statement-breakpoint
CREATE TABLE `board_members` (
	`id` text PRIMARY KEY NOT NULL,
	`position_id` text NOT NULL,
	`member_id` text NOT NULL,
	`term_start` integer NOT NULL,
	`term_end` integer,
	`is_current` integer DEFAULT true,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`position_id`) REFERENCES `board_positions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `board_members_current_idx` ON `board_members` (`is_current`);--> statement-breakpoint
CREATE TABLE `board_positions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`email_alias` text,
	`election_year_parity` text,
	`term_years` integer DEFAULT 2,
	`sort_order` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `certification_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`validity_months` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `certifications` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`certification_type_id` text NOT NULL,
	`earned_date` integer NOT NULL,
	`expires_at` integer,
	`document_url` text,
	`verified_by` text,
	`verified_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`certification_type_id`) REFERENCES `certification_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`verified_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `certifications_member_cert_idx` ON `certifications` (`member_id`,`certification_type_id`);--> statement-breakpoint
CREATE TABLE `discipline_cases` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`status` text DEFAULT 'filed' NOT NULL,
	`charges` text NOT NULL,
	`evidence` text,
	`filed_by` text,
	`filed_at` integer NOT NULL,
	`certified_mail_sent_at` integer,
	`certified_mail_tracking` text,
	`hearing_date` integer,
	`member_statement` text,
	`decision` text,
	`votes_for` integer,
	`votes_against` integer,
	`decided_at` integer,
	`appeal_requested_at` integer,
	`appeal_hearing_date` integer,
	`appeal_result` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`filed_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`file_url` text NOT NULL,
	`file_type` text NOT NULL,
	`file_size` integer,
	`access_level` text NOT NULL,
	`download_count` integer DEFAULT 0,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `documents_category_idx` ON `documents` (`category`);--> statement-breakpoint
CREATE INDEX `documents_access_level_idx` ON `documents` (`access_level`);--> statement-breakpoint
CREATE TABLE `dues_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`amount` integer NOT NULL,
	`payment_type` text NOT NULL,
	`payment_method` text NOT NULL,
	`stripe_payment_id` text,
	`check_number` text,
	`period_start` integer,
	`period_end` integer,
	`credits_applied` integer DEFAULT 0,
	`status` text DEFAULT 'completed' NOT NULL,
	`refunded_at` integer,
	`refund_reason` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `dues_payments_member_id_idx` ON `dues_payments` (`member_id`);--> statement-breakpoint
CREATE TABLE `event_registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`member_id` text NOT NULL,
	`status` text DEFAULT 'registered' NOT NULL,
	`waitlist_position` integer,
	`division` text,
	`classification` text,
	`stripe_payment_id` text,
	`amount_paid` integer,
	`credits_applied` integer DEFAULT 0,
	`refunded_at` integer,
	`checked_in_at` integer,
	`checked_in_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`checked_in_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_registrations_event_member_idx` ON `event_registrations` (`event_id`,`member_id`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`event_type` text NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	`location` text,
	`range_ids` text,
	`max_participants` integer,
	`registration_deadline` integer,
	`cost` integer DEFAULT 0,
	`requires_certification` text,
	`members_only` integer DEFAULT true,
	`is_recurring` integer DEFAULT false,
	`recurrence_rule` text,
	`parent_event_id` text,
	`director_id` text,
	`contact_email` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`cancelled_at` integer,
	`cancellation_reason` text,
	`is_public` integer DEFAULT false,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`parent_event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`director_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `events_start_time_idx` ON `events` (`start_time`);--> statement-breakpoint
CREATE INDEX `events_event_type_idx` ON `events` (`event_type`);--> statement-breakpoint
CREATE INDEX `events_status_idx` ON `events` (`status`);--> statement-breakpoint
CREATE TABLE `guest_visits` (
	`id` text PRIMARY KEY NOT NULL,
	`guest_id` text NOT NULL,
	`host_member_id` text NOT NULL,
	`waiver_signature_url` text,
	`waiver_agreed_at` integer NOT NULL,
	`waiver_ip_address` text,
	`waiver_user_agent` text,
	`signed_in_at` integer NOT NULL,
	`signed_out_at` integer,
	`offline_id` text,
	`synced_at` integer,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`host_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `guest_visits_guest_id_idx` ON `guest_visits` (`guest_id`);--> statement-breakpoint
CREATE INDEX `guest_visits_host_member_idx` ON `guest_visits` (`host_member_id`);--> statement-breakpoint
CREATE INDEX `guest_visits_signed_in_at_idx` ON `guest_visits` (`signed_in_at`);--> statement-breakpoint
CREATE TABLE `guests` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`created_by_member_id` text NOT NULL,
	`visit_count_current_year` integer DEFAULT 0,
	`visit_count_year` integer,
	`last_visit_at` integer,
	`converted_to_member_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`banned_at` integer,
	`banned_reason` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`converted_to_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `guests_email_idx` ON `guests` (`email`);--> statement-breakpoint
CREATE TABLE `match_results` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`member_id` text,
	`shooter_name` text,
	`division` text,
	`classification` text,
	`overall_place` integer,
	`division_place` integer,
	`total_time` real,
	`total_points` real,
	`penalty_count` integer,
	`stage_results` text,
	`practiscore_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `match_results_event_id_idx` ON `match_results` (`event_id`);--> statement-breakpoint
CREATE INDEX `match_results_member_id_idx` ON `match_results` (`member_id`);--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`badge_number` text,
	`membership_type` text NOT NULL,
	`status` text DEFAULT 'prospect' NOT NULL,
	`primary_member_id` text,
	`family_role` text,
	`join_date` integer,
	`expiration_date` integer,
	`probation_ends_at` integer,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`phone` text NOT NULL,
	`date_of_birth` integer,
	`address_line1` text NOT NULL,
	`address_line2` text,
	`city` text NOT NULL,
	`state` text DEFAULT 'TX' NOT NULL,
	`zip` text NOT NULL,
	`vehicle_description` text,
	`license_plate` text,
	`emergency_contact_name` text NOT NULL,
	`emergency_contact_phone` text NOT NULL,
	`referral_code` text,
	`referred_by` text,
	`has_texas_ltc` integer DEFAULT false,
	`ltc_number` text,
	`continuous_years` integer DEFAULT 0,
	`joined_before_2011` integer DEFAULT false,
	`work_days_completed` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`primary_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`referred_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `members_badge_number_unique` ON `members` (`badge_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `members_referral_code_unique` ON `members` (`referral_code`);--> statement-breakpoint
CREATE INDEX `members_user_id_idx` ON `members` (`user_id`);--> statement-breakpoint
CREATE INDEX `members_status_idx` ON `members` (`status`);--> statement-breakpoint
CREATE INDEX `members_expiration_idx` ON `members` (`expiration_date`);--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`general_announcements` text DEFAULT '{"email":true}',
	`safety_alerts` text DEFAULT '{"email":true,"sms":true}',
	`event_reminders` text DEFAULT '{"email":true,"sms":false}',
	`dues_reminders` text DEFAULT '{"email":true,"sms":true}',
	`range_status` text DEFAULT '{"email":false,"sms":true}',
	`newsletter` text DEFAULT '{"email":true}',
	`match_results` text DEFAULT '{"email":true}',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notification_preferences_user_id_unique` ON `notification_preferences` (`user_id`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`variant_id` text,
	`quantity` integer NOT NULL,
	`unit_price` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `order_items_order_id_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text,
	`member_id` text NOT NULL,
	`subtotal` integer NOT NULL,
	`tax` integer NOT NULL,
	`shipping` integer DEFAULT 0 NOT NULL,
	`credits_applied` integer DEFAULT 0,
	`total` integer NOT NULL,
	`stripe_payment_id` text,
	`fulfillment_type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`shipping_address` text,
	`tracking_number` text,
	`shipped_at` integer,
	`ready_at` integer,
	`picked_up_at` integer,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE INDEX `orders_member_id_idx` ON `orders` (`member_id`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`sku` text,
	`price_adjustment` integer DEFAULT 0,
	`inventory_count` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true,
	`sort_order` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_variants_sku_unique` ON `product_variants` (`sku`);--> statement-breakpoint
CREATE INDEX `product_variants_product_id_idx` ON `product_variants` (`product_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`member_price` integer NOT NULL,
	`inventory_count` integer DEFAULT 0 NOT NULL,
	`low_stock_threshold` integer DEFAULT 5,
	`images` text,
	`is_active` integer DEFAULT true,
	`sort_order` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category`);--> statement-breakpoint
CREATE INDEX `products_is_active_idx` ON `products` (`is_active`);--> statement-breakpoint
CREATE TABLE `range_status` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'open' NOT NULL,
	`status_note` text,
	`expires_at` integer,
	`calendar_event_id` text,
	`updated_by` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`calendar_event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`updated_by` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`updated_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `volunteer_hours` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`date` integer NOT NULL,
	`hours` real NOT NULL,
	`activity` text NOT NULL,
	`event_id` text,
	`notes` text,
	`verified_by` text,
	`verified_at` integer,
	`credit_amount` integer NOT NULL,
	`credit_used` integer DEFAULT 0,
	`fiscal_year` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`verified_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `volunteer_hours_member_id_idx` ON `volunteer_hours` (`member_id`);--> statement-breakpoint
CREATE INDEX `volunteer_hours_fiscal_year_idx` ON `volunteer_hours` (`fiscal_year`);