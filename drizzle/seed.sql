-- Austin Rifle Club - Database Seed Data
-- This file populates the database with initial data for development/testing
-- Uses INSERT OR IGNORE to be idempotent (safe to run multiple times)

-- =============================================================================
-- RANGE STATUS
-- =============================================================================
INSERT OR IGNORE INTO range_status (id, name, description, max_distance, status, status_note, features, updated_at) VALUES
  ('100yd', '100-Yard Range', 'Primary rifle range with covered firing line', 100, 'open', NULL, '["covered_firing_line", "target_frames", "benches"]', datetime('now')),
  ('200yd', '200-Yard Range', 'Extended rifle range', 200, 'open', NULL, '["target_frames", "spotting_scopes"]', datetime('now')),
  ('300yd', '300-Yard Range', 'Long range rifle', 300, 'open', NULL, '["steel_targets", "electronic_targets"]', datetime('now')),
  ('pistol', 'Pistol Range', 'Covered pistol range with multiple lanes', 25, 'open', NULL, '["covered", "multiple_lanes", "steel_plates"]', datetime('now')),
  ('shotgun', 'Shotgun Range', 'Trap and skeet fields', 50, 'open', NULL, '["trap_house", "skeet_house", "5_stand"]', datetime('now')),
  ('action', 'Action Pistol Bay', 'Competition-style pistol bay', 50, 'open', NULL, '["steel_targets", "barricades", "props"]', datetime('now'));

-- =============================================================================
-- MEMBERSHIP TYPES
-- =============================================================================
INSERT OR IGNORE INTO membership_types (id, name, description, annual_dues, initiation_fee, guest_limit, features, is_active) VALUES
  ('individual', 'Individual', 'Standard individual membership', 20000, 5000, 4, '["range_access", "events", "voting"]', 1),
  ('family', 'Family', 'Membership for family of up to 4', 30000, 7500, 6, '["range_access", "events", "voting", "family_members"]', 1),
  ('life', 'Life', 'Lifetime membership', 0, 250000, 6, '["range_access", "events", "voting", "no_dues"]', 1),
  ('associate', 'Associate', 'Non-voting membership', 15000, 2500, 2, '["range_access", "events"]', 1);

-- =============================================================================
-- RANGES (detailed configuration)
-- =============================================================================
INSERT OR IGNORE INTO ranges (id, name, short_name, description, max_distance_yards, covered, allowed_calibers, special_rules, display_order, is_active) VALUES
  ('range-100yd', '100-Yard Rifle Range', '100yd', 'Primary rifle range with covered firing line and multiple target frames', 100, 1, '["rifle", "pistol"]', 'No tracer or incendiary ammunition. Cease fire every 30 minutes for target changes.', 1, 1),
  ('range-200yd', '200-Yard Rifle Range', '200yd', 'Extended rifle range with electronic targets', 200, 0, '["rifle"]', 'Rifle calibers only. Electronic targets available.', 2, 1),
  ('range-300yd', '300-Yard Rifle Range', '300yd', 'Long distance rifle range', 300, 0, '["rifle"]', 'Prone and bench shooting only. No rapid fire.', 3, 1),
  ('range-pistol', 'Pistol Range', 'Pistol', 'Covered pistol range with steel and paper targets', 25, 1, '["pistol", "pcc"]', 'Pistol calibers only. Draw from holster allowed for certified members.', 4, 1),
  ('range-shotgun', 'Shotgun Range', 'Shotgun', 'Trap and skeet fields', 50, 0, '["shotgun"]', 'Shotguns only. Eye and ear protection required.', 5, 1),
  ('range-action', 'Action Pistol Bay', 'Action', 'Competition and training bay', 50, 0, '["pistol", "pcc"]', 'Reserved for matches and authorized training only.', 6, 1);

-- =============================================================================
-- CERTIFICATION TYPES
-- =============================================================================
INSERT OR IGNORE INTO certification_types (id, name, description, requirements, valid_days, is_required_for_membership) VALUES
  ('safety', 'Range Safety Orientation', 'Basic club safety orientation required for all members', 'Complete safety orientation class', NULL, 1),
  ('rso', 'Range Safety Officer', 'Qualified to serve as RSO during club events', 'NRA RSO certification + club orientation', 730, 0),
  ('holster', 'Holster Certification', 'Certified to draw from holster on pistol range', 'Complete holster qualification course', 365, 0),
  ('steel', 'Steel Target Certification', 'Certified for steel target shooting', 'Complete steel target safety class', NULL, 0);

-- =============================================================================
-- VOLUNTEER ACTIVITY TYPES
-- =============================================================================
INSERT OR IGNORE INTO volunteer_activity_types (id, name, description, credit_rate, max_credits_per_day) VALUES
  ('work-day', 'Work Day', 'General club maintenance and improvement', 2500, 5000),
  ('rso', 'RSO Duty', 'Serving as Range Safety Officer', 3000, 6000),
  ('match-staff', 'Match Staff', 'Helping run club matches', 2500, 5000),
  ('board', 'Board Meeting', 'Board of Directors meeting attendance', 2500, 2500),
  ('special', 'Special Project', 'Special projects as assigned', 2500, 10000);

-- =============================================================================
-- SAMPLE EVENTS (next 3 months)
-- =============================================================================
INSERT OR IGNORE INTO events (id, title, description, event_type, start_time, end_time, location, max_participants, cost, is_public, is_member_only, requires_registration, status, range_ids, created_at, updated_at) VALUES
  ('evt-001', 'Monthly IDPA Match', 'Monthly IDPA-style competition open to all members', 'match', datetime('now', '+7 days', 'start of day', '+8 hours'), datetime('now', '+7 days', 'start of day', '+14 hours'), 'Action Pistol Bay', 40, 2500, 1, 1, 1, 'published', '["range-action"]', datetime('now'), datetime('now')),
  ('evt-002', 'New Member Orientation', 'Required orientation for new members', 'orientation', datetime('now', '+14 days', 'start of day', '+9 hours'), datetime('now', '+14 days', 'start of day', '+12 hours'), 'Clubhouse', 20, 0, 0, 1, 1, 'published', NULL, datetime('now'), datetime('now')),
  ('evt-003', 'Work Day', 'Monthly work day - all members welcome', 'work_day', datetime('now', '+21 days', 'start of day', '+8 hours'), datetime('now', '+21 days', 'start of day', '+14 hours'), 'Entire Facility', NULL, 0, 1, 0, 0, 'published', NULL, datetime('now'), datetime('now')),
  ('evt-004', 'Steel Challenge Match', 'Steel Challenge competition', 'match', datetime('now', '+28 days', 'start of day', '+8 hours'), datetime('now', '+28 days', 'start of day', '+15 hours'), 'Pistol Range', 30, 2000, 1, 1, 1, 'published', '["range-pistol"]', datetime('now'), datetime('now')),
  ('evt-005', 'RSO Certification Class', 'NRA Range Safety Officer certification', 'class', datetime('now', '+35 days', 'start of day', '+8 hours'), datetime('now', '+35 days', 'start of day', '+17 hours'), 'Clubhouse', 15, 7500, 0, 1, 1, 'published', NULL, datetime('now'), datetime('now')),
  ('evt-006', 'Holster Qualification', 'Qualification for holster draw certification', 'class', datetime('now', '+42 days', 'start of day', '+9 hours'), datetime('now', '+42 days', 'start of day', '+12 hours'), 'Pistol Range', 10, 2500, 0, 1, 1, 'published', '["range-pistol"]', datetime('now'), datetime('now')),
  ('evt-007', 'Board Meeting', 'Monthly Board of Directors meeting', 'meeting', datetime('now', '+45 days', 'start of day', '+19 hours'), datetime('now', '+45 days', 'start of day', '+21 hours'), 'Clubhouse', NULL, 0, 0, 1, 0, 'published', NULL, datetime('now'), datetime('now')),
  ('evt-008', 'Long Range Rifle Clinic', 'Introduction to long range shooting', 'class', datetime('now', '+49 days', 'start of day', '+8 hours'), datetime('now', '+49 days', 'start of day', '+16 hours'), '300-Yard Range', 12, 5000, 1, 1, 1, 'published', '["range-300yd"]', datetime('now'), datetime('now'));

-- =============================================================================
-- CLUB SETTINGS
-- =============================================================================
INSERT OR IGNORE INTO settings (key, value, description, updated_at) VALUES
  ('club_name', '"Austin Rifle Club"', 'Official club name', datetime('now')),
  ('club_address', '"16312 Littig Rd, Manor, TX 78653"', 'Club physical address', datetime('now')),
  ('club_phone', '"(512) 555-0100"', 'Club phone number', datetime('now')),
  ('club_email', '"info@austinrifleclub.org"', 'Club contact email', datetime('now')),
  ('operating_hours', '{"weekday": "8am-Sunset", "weekend": "7am-Sunset"}', 'Normal operating hours', datetime('now')),
  ('guest_fee', '1500', 'Guest visit fee in cents', datetime('now')),
  ('annual_guest_limit', '4', 'Maximum guests per member per year', datetime('now')),
  ('dues_grace_period_days', '30', 'Days after expiration before suspension', datetime('now')),
  ('volunteer_credit_rate', '25', 'Dollars credit per volunteer hour (as cents)', datetime('now')),
  ('max_volunteer_credit', '100', 'Maximum volunteer credit toward dues (as dollars)', datetime('now'));
