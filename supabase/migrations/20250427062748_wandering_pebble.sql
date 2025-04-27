/*
  # Fix admin authentication

  1. Changes
    - Remove existing admin user
    - Create new admin user with correct auth setup
    - Update RLS policies for proper admin access
*/

-- First, remove existing admin user if exists
DELETE FROM admins WHERE username = 'admin';

-- Create admin user with proper auth
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Insert into admins table
INSERT INTO admins (
  username,
  password_hash
) VALUES (
  'admin',
  crypt('admin123', gen_salt('bf'))
);

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