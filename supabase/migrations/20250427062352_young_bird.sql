/*
  # Create admin authentication system

  1. New Tables
    - `admins`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `admins` table
    - Add policy for admin authentication
    - Update feedback table policies
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create default admin (username: admin, password: admin123)
INSERT INTO admins (username, password_hash)
VALUES ('admin', crypt('admin123', gen_salt('bf')))
ON CONFLICT (username) DO NOTHING;

-- Add RLS policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admins' AND policyname = 'Allow public read for admin usernames'
  ) THEN
    CREATE POLICY "Allow public read for admin usernames"
      ON admins
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Update feedback table policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

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
        WHERE admins.username = current_user
      ));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feedback' AND policyname = 'Anyone can submit feedback'
  ) THEN
    CREATE POLICY "Anyone can submit feedback"
      ON feedback
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;