-- Seed certification types for event access control
-- Run with: wrangler d1 execute DB --file scripts/seed-certification-types.sql

INSERT INTO certification_types (id, name, description, validity_months)
VALUES
  ('cert-type-nmo', 'NMO', 'New Member Orientation - required for range access', NULL),
  ('cert-type-nmse', 'NMSE', 'New Member Safety Evaluation - required for unsupervised range use', NULL),
  ('cert-type-rso', 'RSO', 'Range Safety Officer', 24),
  ('cert-type-instructor', 'Instructor', 'Certified instructor - can teach classes', 24)
ON CONFLICT (id) DO NOTHING;
