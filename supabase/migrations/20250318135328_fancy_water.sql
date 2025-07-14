/*
  # Create dreams table

  1. New Tables
    - `dreams`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `content` (text)
      - `emotions` (text array)
      - `keywords` (text array)
      - `style` (text)
      - `analysis` (jsonb)
      - `animation` (jsonb)
      - `is_public` (boolean)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `dreams` table
    - Add policies for authenticated users to:
      - Read their own dreams
      - Create new dreams
      - Update their own dreams
      - Delete their own dreams
*/

CREATE TABLE IF NOT EXISTS dreams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  emotions text[] DEFAULT '{}',
  keywords text[] DEFAULT '{}',
  style text,
  analysis jsonb DEFAULT '{}',
  animation jsonb DEFAULT '{}',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own dreams
CREATE POLICY "Users can read own dreams"
  ON dreams
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to create dreams
CREATE POLICY "Users can create dreams"
  ON dreams
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own dreams
CREATE POLICY "Users can update own dreams"
  ON dreams
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own dreams
CREATE POLICY "Users can delete own dreams"
  ON dreams
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the update function
CREATE TRIGGER update_dreams_updated_at
  BEFORE UPDATE ON dreams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();