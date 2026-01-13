PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_announcements` (
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
	FOREIGN KEY (`created_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_announcements`("id", "title", "body", "announcement_type", "publish_at", "expires_at", "is_pinned", "send_email", "send_sms", "email_sent_at", "sms_sent_at", "created_by", "created_at", "updated_at") SELECT "id", "title", "body", "announcement_type", "publish_at", "expires_at", "is_pinned", "send_email", "send_sms", "email_sent_at", "sms_sent_at", "created_by", "created_at", "updated_at" FROM `announcements`;--> statement-breakpoint
DROP TABLE `announcements`;--> statement-breakpoint
ALTER TABLE `__new_announcements` RENAME TO `announcements`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `announcements_publish_at_idx` ON `announcements` (`publish_at`);--> statement-breakpoint
CREATE TABLE `__new_applications` (
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
	FOREIGN KEY (`safety_eval_event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`safety_eval_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`orientation_event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`approved_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`rejected_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_applications`("id", "user_id", "status", "membership_type", "how_heard_about_us", "utm_source", "utm_medium", "utm_campaign", "government_id_url", "background_consent_url", "veteran_doc_url", "has_texas_ltc", "ltc_number", "ltc_verified_at", "stripe_payment_intent_id", "amount_paid", "paid_at", "safety_eval_event_id", "safety_eval_date", "safety_eval_result", "safety_eval_notes", "safety_eval_by", "orientation_event_id", "orientation_date", "orientation_completed", "vote_meeting_date", "votes_for", "votes_against", "votes_abstain", "approved_at", "approved_by", "rejected_at", "rejected_by", "rejection_reason", "expires_at", "resume_token", "created_at", "updated_at") SELECT "id", "user_id", "status", "membership_type", "how_heard_about_us", "utm_source", "utm_medium", "utm_campaign", "government_id_url", "background_consent_url", "veteran_doc_url", "has_texas_ltc", "ltc_number", "ltc_verified_at", "stripe_payment_intent_id", "amount_paid", "paid_at", "safety_eval_event_id", "safety_eval_date", "safety_eval_result", "safety_eval_notes", "safety_eval_by", "orientation_event_id", "orientation_date", "orientation_completed", "vote_meeting_date", "votes_for", "votes_against", "votes_abstain", "approved_at", "approved_by", "rejected_at", "rejected_by", "rejection_reason", "expires_at", "resume_token", "created_at", "updated_at" FROM `applications`;--> statement-breakpoint
DROP TABLE `applications`;--> statement-breakpoint
ALTER TABLE `__new_applications` RENAME TO `applications`;--> statement-breakpoint
CREATE UNIQUE INDEX `applications_resume_token_unique` ON `applications` (`resume_token`);--> statement-breakpoint
CREATE INDEX `applications_status_idx` ON `applications` (`status`);--> statement-breakpoint
CREATE INDEX `applications_user_id_idx` ON `applications` (`user_id`);--> statement-breakpoint
CREATE INDEX `applications_user_status_idx` ON `applications` (`user_id`,`status`);--> statement-breakpoint
CREATE TABLE `__new_audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`target_type` text,
	`target_id` text,
	`details` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_audit_log`("id", "user_id", "action", "target_type", "target_id", "details", "ip_address", "user_agent", "created_at") SELECT "id", "user_id", "action", "target_type", "target_id", "details", "ip_address", "user_agent", "created_at" FROM `audit_log`;--> statement-breakpoint
DROP TABLE `audit_log`;--> statement-breakpoint
ALTER TABLE `__new_audit_log` RENAME TO `audit_log`;--> statement-breakpoint
CREATE INDEX `audit_log_user_id_idx` ON `audit_log` (`user_id`);--> statement-breakpoint
CREATE INDEX `audit_log_target_idx` ON `audit_log` (`target_type`,`target_id`);--> statement-breakpoint
CREATE INDEX `audit_log_created_at_idx` ON `audit_log` (`created_at`);--> statement-breakpoint
CREATE TABLE `__new_certifications` (
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
	FOREIGN KEY (`verified_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_certifications`("id", "member_id", "certification_type_id", "earned_date", "expires_at", "document_url", "verified_by", "verified_at", "created_at", "updated_at") SELECT "id", "member_id", "certification_type_id", "earned_date", "expires_at", "document_url", "verified_by", "verified_at", "created_at", "updated_at" FROM `certifications`;--> statement-breakpoint
DROP TABLE `certifications`;--> statement-breakpoint
ALTER TABLE `__new_certifications` RENAME TO `certifications`;--> statement-breakpoint
CREATE INDEX `certifications_member_cert_idx` ON `certifications` (`member_id`,`certification_type_id`);--> statement-breakpoint
CREATE TABLE `__new_discipline_cases` (
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
	FOREIGN KEY (`filed_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_discipline_cases`("id", "member_id", "status", "charges", "evidence", "filed_by", "filed_at", "certified_mail_sent_at", "certified_mail_tracking", "hearing_date", "member_statement", "decision", "votes_for", "votes_against", "decided_at", "appeal_requested_at", "appeal_hearing_date", "appeal_result", "created_at", "updated_at") SELECT "id", "member_id", "status", "charges", "evidence", "filed_by", "filed_at", "certified_mail_sent_at", "certified_mail_tracking", "hearing_date", "member_statement", "decision", "votes_for", "votes_against", "decided_at", "appeal_requested_at", "appeal_hearing_date", "appeal_result", "created_at", "updated_at" FROM `discipline_cases`;--> statement-breakpoint
DROP TABLE `discipline_cases`;--> statement-breakpoint
ALTER TABLE `__new_discipline_cases` RENAME TO `discipline_cases`;--> statement-breakpoint
CREATE TABLE `__new_documents` (
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
	FOREIGN KEY (`created_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_documents`("id", "title", "description", "category", "file_url", "file_type", "file_size", "access_level", "download_count", "created_by", "created_at", "updated_at") SELECT "id", "title", "description", "category", "file_url", "file_type", "file_size", "access_level", "download_count", "created_by", "created_at", "updated_at" FROM `documents`;--> statement-breakpoint
DROP TABLE `documents`;--> statement-breakpoint
ALTER TABLE `__new_documents` RENAME TO `documents`;--> statement-breakpoint
CREATE INDEX `documents_category_idx` ON `documents` (`category`);--> statement-breakpoint
CREATE INDEX `documents_access_level_idx` ON `documents` (`access_level`);--> statement-breakpoint
CREATE TABLE `__new_event_registrations` (
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
	FOREIGN KEY (`checked_in_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_event_registrations`("id", "event_id", "member_id", "status", "waitlist_position", "division", "classification", "stripe_payment_id", "amount_paid", "credits_applied", "refunded_at", "checked_in_at", "checked_in_by", "created_at", "updated_at") SELECT "id", "event_id", "member_id", "status", "waitlist_position", "division", "classification", "stripe_payment_id", "amount_paid", "credits_applied", "refunded_at", "checked_in_at", "checked_in_by", "created_at", "updated_at" FROM `event_registrations`;--> statement-breakpoint
DROP TABLE `event_registrations`;--> statement-breakpoint
ALTER TABLE `__new_event_registrations` RENAME TO `event_registrations`;--> statement-breakpoint
CREATE UNIQUE INDEX `event_registrations_event_member_idx` ON `event_registrations` (`event_id`,`member_id`);--> statement-breakpoint
CREATE INDEX `event_registrations_member_id_idx` ON `event_registrations` (`member_id`);--> statement-breakpoint
CREATE INDEX `event_registrations_event_status_idx` ON `event_registrations` (`event_id`,`status`);--> statement-breakpoint
CREATE TABLE `__new_events` (
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
	`recurrence_end_date` integer,
	`exclude_dates` text,
	`parent_event_id` text,
	`occurrence_date` integer,
	`mec_post_id` integer,
	`mec_source_url` text,
	`director_id` text,
	`contact_email` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`cancelled_at` integer,
	`cancellation_reason` text,
	`is_public` integer DEFAULT false,
	`board_only` integer DEFAULT false,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`parent_event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`director_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_events`("id", "title", "description", "event_type", "start_time", "end_time", "location", "range_ids", "max_participants", "registration_deadline", "cost", "requires_certification", "members_only", "is_recurring", "recurrence_rule", "recurrence_end_date", "exclude_dates", "parent_event_id", "occurrence_date", "mec_post_id", "mec_source_url", "director_id", "contact_email", "status", "cancelled_at", "cancellation_reason", "is_public", "board_only", "created_by", "created_at", "updated_at") SELECT "id", "title", "description", "event_type", "start_time", "end_time", "location", "range_ids", "max_participants", "registration_deadline", "cost", "requires_certification", "members_only", "is_recurring", "recurrence_rule", "recurrence_end_date", "exclude_dates", "parent_event_id", "occurrence_date", "mec_post_id", "mec_source_url", "director_id", "contact_email", "status", "cancelled_at", "cancellation_reason", "is_public", "board_only", "created_by", "created_at", "updated_at" FROM `events`;--> statement-breakpoint
DROP TABLE `events`;--> statement-breakpoint
ALTER TABLE `__new_events` RENAME TO `events`;--> statement-breakpoint
CREATE INDEX `events_start_time_idx` ON `events` (`start_time`);--> statement-breakpoint
CREATE INDEX `events_event_type_idx` ON `events` (`event_type`);--> statement-breakpoint
CREATE INDEX `events_status_idx` ON `events` (`status`);--> statement-breakpoint
CREATE INDEX `events_parent_event_idx` ON `events` (`parent_event_id`);--> statement-breakpoint
CREATE INDEX `events_mec_post_idx` ON `events` (`mec_post_id`);--> statement-breakpoint
CREATE TABLE `__new_guests` (
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
	FOREIGN KEY (`converted_to_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_guests`("id", "name", "email", "phone", "created_by_member_id", "visit_count_current_year", "visit_count_year", "last_visit_at", "converted_to_member_id", "status", "banned_at", "banned_reason", "created_at", "updated_at") SELECT "id", "name", "email", "phone", "created_by_member_id", "visit_count_current_year", "visit_count_year", "last_visit_at", "converted_to_member_id", "status", "banned_at", "banned_reason", "created_at", "updated_at" FROM `guests`;--> statement-breakpoint
DROP TABLE `guests`;--> statement-breakpoint
ALTER TABLE `__new_guests` RENAME TO `guests`;--> statement-breakpoint
CREATE INDEX `guests_email_idx` ON `guests` (`email`);--> statement-breakpoint
CREATE TABLE `__new_match_results` (
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
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_match_results`("id", "event_id", "member_id", "shooter_name", "division", "classification", "overall_place", "division_place", "total_time", "total_points", "penalty_count", "stage_results", "practiscore_id", "created_at", "updated_at") SELECT "id", "event_id", "member_id", "shooter_name", "division", "classification", "overall_place", "division_place", "total_time", "total_points", "penalty_count", "stage_results", "practiscore_id", "created_at", "updated_at" FROM `match_results`;--> statement-breakpoint
DROP TABLE `match_results`;--> statement-breakpoint
ALTER TABLE `__new_match_results` RENAME TO `match_results`;--> statement-breakpoint
CREATE INDEX `match_results_event_id_idx` ON `match_results` (`event_id`);--> statement-breakpoint
CREATE INDEX `match_results_member_id_idx` ON `match_results` (`member_id`);--> statement-breakpoint
CREATE TABLE `__new_members` (
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
	FOREIGN KEY (`primary_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`referred_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_members`("id", "user_id", "badge_number", "membership_type", "status", "primary_member_id", "family_role", "join_date", "expiration_date", "probation_ends_at", "first_name", "last_name", "phone", "date_of_birth", "address_line1", "address_line2", "city", "state", "zip", "vehicle_description", "license_plate", "emergency_contact_name", "emergency_contact_phone", "referral_code", "referred_by", "has_texas_ltc", "ltc_number", "continuous_years", "joined_before_2011", "work_days_completed", "created_at", "updated_at") SELECT "id", "user_id", "badge_number", "membership_type", "status", "primary_member_id", "family_role", "join_date", "expiration_date", "probation_ends_at", "first_name", "last_name", "phone", "date_of_birth", "address_line1", "address_line2", "city", "state", "zip", "vehicle_description", "license_plate", "emergency_contact_name", "emergency_contact_phone", "referral_code", "referred_by", "has_texas_ltc", "ltc_number", "continuous_years", "joined_before_2011", "work_days_completed", "created_at", "updated_at" FROM `members`;--> statement-breakpoint
DROP TABLE `members`;--> statement-breakpoint
ALTER TABLE `__new_members` RENAME TO `members`;--> statement-breakpoint
CREATE UNIQUE INDEX `members_badge_number_unique` ON `members` (`badge_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `members_referral_code_unique` ON `members` (`referral_code`);--> statement-breakpoint
CREATE INDEX `members_user_id_idx` ON `members` (`user_id`);--> statement-breakpoint
CREATE INDEX `members_status_idx` ON `members` (`status`);--> statement-breakpoint
CREATE INDEX `members_expiration_idx` ON `members` (`expiration_date`);--> statement-breakpoint
CREATE INDEX `members_expiration_status_idx` ON `members` (`expiration_date`,`status`);--> statement-breakpoint
CREATE TABLE `__new_range_status` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'open' NOT NULL,
	`status_note` text,
	`expires_at` integer,
	`calendar_event_id` text,
	`updated_by` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`calendar_event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`updated_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_range_status`("id", "name", "description", "status", "status_note", "expires_at", "calendar_event_id", "updated_by", "updated_at") SELECT "id", "name", "description", "status", "status_note", "expires_at", "calendar_event_id", "updated_by", "updated_at" FROM `range_status`;--> statement-breakpoint
DROP TABLE `range_status`;--> statement-breakpoint
ALTER TABLE `__new_range_status` RENAME TO `range_status`;--> statement-breakpoint
CREATE TABLE `__new_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`updated_by` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`updated_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_settings`("key", "value", "description", "category", "updated_by", "updated_at") SELECT "key", "value", "description", "category", "updated_by", "updated_at" FROM `settings`;--> statement-breakpoint
DROP TABLE `settings`;--> statement-breakpoint
ALTER TABLE `__new_settings` RENAME TO `settings`;--> statement-breakpoint
CREATE TABLE `__new_volunteer_hours` (
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
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`verified_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_volunteer_hours`("id", "member_id", "date", "hours", "activity", "event_id", "notes", "verified_by", "verified_at", "credit_amount", "credit_used", "fiscal_year", "created_at", "updated_at") SELECT "id", "member_id", "date", "hours", "activity", "event_id", "notes", "verified_by", "verified_at", "credit_amount", "credit_used", "fiscal_year", "created_at", "updated_at" FROM `volunteer_hours`;--> statement-breakpoint
DROP TABLE `volunteer_hours`;--> statement-breakpoint
ALTER TABLE `__new_volunteer_hours` RENAME TO `volunteer_hours`;--> statement-breakpoint
CREATE INDEX `volunteer_hours_member_id_idx` ON `volunteer_hours` (`member_id`);--> statement-breakpoint
CREATE INDEX `volunteer_hours_fiscal_year_idx` ON `volunteer_hours` (`fiscal_year`);