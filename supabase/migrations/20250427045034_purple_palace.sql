/*
  # Create feedback table

  1. New Tables
    - `feedback`
      - `id` (uuid, primary key)
      - `user_name` (text, required)
      - `email` (text, required)
      - `feedback_text` (text, required)
      - `category` (text, optional)
      - `created_at` (timestamp with time zone, default now())
  2. Security
    - Enable RLS on `feedback` table
    - Add policy for anonymous users to insert feedback
    - Add policy for authenticated users to read all feedback
*/

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  email text NOT NULL,
  feedback_text text NOT NULL,
  category text NOT NULL DEFAULT 'suggestion',
  created_at timestamptz DEFAULT now()
);

-- Create index on frequently queried columns
CREATE INDEX IF NOT EXISTS feedback_email_idx ON feedback(email);
CREATE INDEX IF NOT EXISTS feedback_category_idx ON feedback(category);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback(created_at);

-- Enable row level security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anonymous users to insert feedback
CREATE POLICY "Anyone can submit feedback"
  ON feedback
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read feedback
CREATE POLICY "Authenticated users can read all feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (true);

-- Anonymous users can also read feedback for this demo
-- In a real application, you might want to restrict this
CREATE POLICY "Anonymous users can read all feedback"
  ON feedback
  FOR SELECT
  TO anon
  USING (true);