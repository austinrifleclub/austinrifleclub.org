-- Create admin user
INSERT INTO users (id, name, email, email_verified, created_at, updated_at)
VALUES (
  'usr_admin_001',
  'Site Admin',
  'admin@austinrifleclub.org',
  1,
  unixepoch(),
  unixepoch()
);

-- Create member profile for admin
INSERT INTO members (
  id, user_id, badge_number, membership_type, status,
  first_name, last_name, phone,
  address_line1, city, state, zip,
  emergency_contact_name, emergency_contact_phone,
  join_date, expiration_date,
  created_at, updated_at
)
VALUES (
  'mbr_admin_001',
  'usr_admin_001',
  'M0001',
  'life',
  'active',
  'Site',
  'Admin',
  '+15125551234',
  '123 Admin St',
  'Austin',
  'TX',
  '78701',
  'Emergency Contact',
  '+15125555555',
  unixepoch(),
  unixepoch('2099-12-31'),
  unixepoch(),
  unixepoch()
);

-- Create board position (if not exists)
INSERT OR IGNORE INTO board_positions (id, title, description, sort_order)
VALUES ('president', 'President', 'Club President', 1);

-- Make admin a board member
INSERT INTO board_members (id, position_id, member_id, term_start, is_current, created_at)
VALUES (
  'bm_admin_001',
  'president',
  'mbr_admin_001',
  unixepoch(),
  1,
  unixepoch()
);
