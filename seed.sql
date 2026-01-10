-- Seed data for Austin Rifle Club
-- Run with: sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite < seed.sql

-- Insert ranges
INSERT INTO range_status (id, name, description, status, status_note, updated_at) VALUES
('A', 'Pistol Range A', '25-yard covered pistol range with 20 positions', 'open', NULL, datetime('now')),
('B', 'Pistol Range B', '50-yard pistol range with steel targets', 'open', NULL, datetime('now')),
('C', 'Rifle Range', '100/200-yard rifle range with benchrest positions', 'open', NULL, datetime('now')),
('D', '.22 Silhouette', 'Metallic silhouette range for .22 rimfire', 'open', NULL, datetime('now')),
('E', 'Pistol Silhouette', 'Metallic silhouette range for handguns', 'closed', 'Target maintenance in progress', datetime('now')),
('F', 'Air Gun Range', 'Indoor 10-meter air rifle and pistol range', 'open', NULL, datetime('now')),
('G', 'Education Center', 'Classroom and training facility', 'event', 'NRA Basic Pistol Course until 4pm', datetime('now')),
('H', 'Action Bay H', 'Multi-purpose action shooting bay', 'open', NULL, datetime('now')),
('I', 'Action Bay I', 'Multi-purpose action shooting bay', 'open', NULL, datetime('now')),
('J', 'Action Bay J', 'Large action bay for matches', 'maintenance', 'Steel target repairs', datetime('now')),
('K', 'Action Bay K', 'Multi-purpose action shooting bay', 'open', NULL, datetime('now')),
('L', 'Multi-Purpose', 'Long-range capable multi-purpose bay', 'open', NULL, datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  status = excluded.status,
  status_note = excluded.status_note,
  updated_at = excluded.updated_at;

-- Insert some sample events
INSERT INTO events (id, title, description, event_type, start_time, end_time, location, max_participants, cost, is_public, created_by, created_at, updated_at) VALUES
('evt_idpa_jan', 'IDPA Match', 'Monthly IDPA match - all skill levels welcome', 'match', datetime('now', '+3 days', 'start of day', '+9 hours'), datetime('now', '+3 days', 'start of day', '+14 hours'), 'Ranges H-K', 40, 20, 1, NULL, datetime('now'), datetime('now')),
('evt_uspsa_jan', 'USPSA Match', 'Monthly USPSA match', 'match', datetime('now', '+10 days', 'start of day', '+8 hours'), datetime('now', '+10 days', 'start of day', '+15 hours'), 'Ranges H-L', 50, 25, 1, NULL, datetime('now'), datetime('now')),
('evt_nra_pistol', 'NRA Basic Pistol', 'NRA Basic Pistol course for beginners', 'class', datetime('now', '+5 days', 'start of day', '+9 hours'), datetime('now', '+5 days', 'start of day', '+17 hours'), 'Range G', 12, 150, 1, NULL, datetime('now'), datetime('now')),
('evt_steel', 'Steel Challenge', 'Monthly Steel Challenge match', 'match', datetime('now', '+17 days', 'start of day', '+9 hours'), datetime('now', '+17 days', 'start of day', '+14 hours'), 'Ranges H-J', 30, 20, 1, NULL, datetime('now'), datetime('now')),
('evt_workday', 'Range Work Day', 'Monthly volunteer work day - earn volunteer credits!', 'workday', datetime('now', '+6 days', 'start of day', '+8 hours'), datetime('now', '+6 days', 'start of day', '+12 hours'), 'Clubhouse', NULL, 0, 1, NULL, datetime('now'), datetime('now')),
('evt_board', 'Board Meeting', 'Monthly board of directors meeting - members welcome to observe', 'meeting', datetime('now', '+14 days', 'start of day', '+19 hours'), datetime('now', '+14 days', 'start of day', '+21 hours'), 'Range G', NULL, 0, 1, NULL, datetime('now'), datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  description = excluded.description,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  updated_at = excluded.updated_at;

-- Insert some settings
INSERT INTO settings (key, value, description, updated_at, updated_by) VALUES
('site_name', 'Austin Rifle Club', 'Name of the club', datetime('now'), NULL),
('dues_individual', '150', 'Annual dues for individual membership', datetime('now'), NULL),
('dues_family', '200', 'Annual dues for family membership', datetime('now'), NULL),
('dues_life', '1500', 'One-time dues for life membership', datetime('now'), NULL),
('referral_credit', '25', 'Credit amount for successful referrals', datetime('now'), NULL),
('guest_visit_limit', '3', 'Max visits per guest per year before membership required', datetime('now'), NULL)
ON CONFLICT(key) DO UPDATE SET
  value = excluded.value,
  updated_at = excluded.updated_at;
