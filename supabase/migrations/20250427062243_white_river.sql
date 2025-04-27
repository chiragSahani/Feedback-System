/*
  # Create admin table and secure access

  1. New Tables
    - `admins`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `admins` table
    - Add policy for admin authentication
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
VALUES ('admin', crypt('admin123', gen_salt('bf')));

-- Add RLS policies
CREATE POLICY "Allow public read for admin usernames"
  ON admins
  FOR SELECT
  TO public
  USING (true);

-- Update feedback table policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.username = current_user
  ));

CREATE POLICY "Anyone can submit feedback"
  ON feedback
  FOR INSERT
  TO public
  WITH CHECK (true);