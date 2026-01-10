-- Austin Rifle Club - Staging Test Data
-- This file contains test users and data for staging environment ONLY
-- DO NOT apply to production!
-- Uses INSERT OR IGNORE to be idempotent (safe to run multiple times)

-- =============================================================================
-- TEST USERS (Better Auth compatible)
-- =============================================================================
-- Password for all test users: "TestPassword123!"
-- These are pre-hashed bcrypt passwords

INSERT OR IGNORE INTO users (id, name, email, email_verified, created_at, updated_at) VALUES
  ('user-admin-001', 'Test Admin', 'admin@staging.austinrifleclub.org', 1, datetime('now'), datetime('now')),
  ('user-member-001', 'Test Member', 'member@staging.austinrifleclub.org', 1, datetime('now'), datetime('now')),
  ('user-member-002', 'Jane Smith', 'jane@staging.austinrifleclub.org', 1, datetime('now'), datetime('now')),
  ('user-applicant-001', 'New Applicant', 'applicant@staging.austinrifleclub.org', 1, datetime('now'), datetime('now'));

-- =============================================================================
-- TEST MEMBERS
-- =============================================================================
INSERT OR IGNORE INTO members (id, user_id, membership_number, membership_type_id, status, role, join_date, dues_paid_through, created_at, updated_at) VALUES
  ('member-admin-001', 'user-admin-001', 'ARC-0001', 'individual', 'active', 'admin', date('now', '-2 years'), date('now', '+1 year'), datetime('now'), datetime('now')),
  ('member-001', 'user-member-001', 'ARC-1001', 'individual', 'active', 'member', date('now', '-1 year'), date('now', '+6 months'), datetime('now'), datetime('now')),
  ('member-002', 'user-member-002', 'ARC-1002', 'family', 'active', 'member', date('now', '-6 months'), date('now', '+6 months'), datetime('now'), datetime('now'));

-- =============================================================================
-- TEST APPLICATION (in progress)
-- =============================================================================
INSERT OR IGNORE INTO applications (id, user_id, status, membership_type, how_heard_about_us, created_at, updated_at) VALUES
  ('app-001', 'user-applicant-001', 'pending_payment', 'individual', 'web_search', datetime('now', '-2 days'), datetime('now'));

-- =============================================================================
-- TEST CERTIFICATIONS
-- =============================================================================
INSERT OR IGNORE INTO certifications (id, member_id, certification_type_id, issued_at, expires_at, issued_by) VALUES
  ('cert-001', 'member-admin-001', 'safety', datetime('now', '-1 year'), NULL, 'member-admin-001'),
  ('cert-002', 'member-admin-001', 'rso', datetime('now', '-6 months'), datetime('now', '+18 months'), 'member-admin-001'),
  ('cert-003', 'member-001', 'safety', datetime('now', '-6 months'), NULL, 'member-admin-001'),
  ('cert-004', 'member-002', 'safety', datetime('now', '-3 months'), NULL, 'member-admin-001');

-- =============================================================================
-- TEST EVENT REGISTRATIONS
-- =============================================================================
INSERT OR IGNORE INTO event_registrations (id, event_id, member_id, status, registered_at) VALUES
  ('reg-001', 'evt-001', 'member-001', 'confirmed', datetime('now', '-1 day')),
  ('reg-002', 'evt-001', 'member-002', 'confirmed', datetime('now', '-1 day')),
  ('reg-003', 'evt-002', 'member-001', 'confirmed', datetime('now'));

-- =============================================================================
-- TEST VOLUNTEER HOURS
-- =============================================================================
INSERT OR IGNORE INTO volunteer_hours (id, member_id, activity_type_id, hours, credits_earned, activity_date, description, logged_by, created_at) VALUES
  ('vol-001', 'member-001', 'work-day', 4.0, 10000, date('now', '-30 days'), 'Range cleanup and maintenance', 'member-admin-001', datetime('now', '-30 days')),
  ('vol-002', 'member-001', 'rso', 6.0, 18000, date('now', '-14 days'), 'RSO duty for IDPA match', 'member-admin-001', datetime('now', '-14 days')),
  ('vol-003', 'member-002', 'work-day', 3.0, 7500, date('now', '-21 days'), 'Painted target frames', 'member-admin-001', datetime('now', '-21 days'));

-- =============================================================================
-- TEST GUEST VISITS
-- =============================================================================
INSERT OR IGNORE INTO guests (id, member_id, first_name, last_name, email, waiver_signed, created_at) VALUES
  ('guest-001', 'member-001', 'Bob', 'Johnson', 'bob@example.com', 1, datetime('now', '-7 days')),
  ('guest-002', 'member-002', 'Alice', 'Williams', 'alice@example.com', 1, datetime('now', '-3 days'));

INSERT OR IGNORE INTO guest_visits (id, guest_id, member_id, visit_date, range_ids, created_at) VALUES
  ('visit-001', 'guest-001', 'member-001', date('now', '-7 days'), '["range-pistol"]', datetime('now', '-7 days')),
  ('visit-002', 'guest-002', 'member-002', date('now', '-3 days'), '["range-100yd", "range-pistol"]', datetime('now', '-3 days'));
