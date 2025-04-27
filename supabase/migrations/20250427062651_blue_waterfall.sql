/*
  # Fix admin authentication

  1. Changes
    - Drop existing admin user
    - Create new admin user with correct credentials
    - Update RLS policies
*/

-- First, remove existing admin user
DELETE FROM admins WHERE username = 'admin';

-- Create admin user with proper auth
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  role
) VALUES (
  'admin',
  crypt('admin123', gen_salt('bf')),
  now(),
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Insert into admins table
INSERT INTO admins (
  username,
  password_hash
) VALUES (
  'admin',
  crypt('admin123', gen_salt('bf'))
) ON CONFLICT (username) DO NOTHING;

-- Ensure RLS policies are correct
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feedback' AND policyname = 'Only admins can view feedback'
  ) THEN
    CREATE POLICY "Only admins can view feedback"
      ON feedback
      FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.username = CURRENT_USER
      ));
  END IF;
END $$;