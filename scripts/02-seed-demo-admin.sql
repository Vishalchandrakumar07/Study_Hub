-- This script creates a demo admin account for testing
-- You'll need to manually add this after creating a user via Supabase Auth

-- Example: After creating a user with email "admin@college.edu" in Supabase Auth,
-- get their UUID and run:
-- INSERT INTO admin_profiles (id, email, name, role)
-- VALUES ('<user-uuid>', 'admin@college.edu', 'Admin User', 'admin');

-- For now, we'll create sample data for testing
INSERT INTO categories (name, description) VALUES
  ('Engineering', 'Engineering courses and materials'),
  ('Science', 'Science courses and materials'),
  ('Commerce', 'Commerce courses and materials'),
  ('Arts', 'Arts courses and materials')
ON CONFLICT (name) DO NOTHING;

INSERT INTO departments (name, category_id, description) VALUES
  ('Computer Science', 1, 'CSE Department'),
  ('Electrical Engineering', 1, 'EEE Department'),
  ('Physics', 2, 'Physics Department'),
  ('Chemistry', 2, 'Chemistry Department')
ON CONFLICT DO NOTHING;
