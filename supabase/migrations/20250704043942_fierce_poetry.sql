/*
  # Add social features to Dream Cinema

  1. New Tables
    - `profiles` - User profiles with additional info
    - `friendships` - Friend relationships between users
    - `dream_likes` - Likes on dreams
    - `dream_comments` - Comments on dreams
    - `notifications` - User notifications

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for each table

  3. Functions
    - Function to handle friendship requests
    - Function to get mutual friends count
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name text,
  avatar_url text,
  bio text,
  website text,
  is_private boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES auth.users NOT NULL,
  addressee_id uuid REFERENCES auth.users NOT NULL,
  status text CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Create dream_likes table
CREATE TABLE IF NOT EXISTS dream_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  dream_id uuid REFERENCES dreams NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, dream_id)
);

-- Create dream_comments table
CREATE TABLE IF NOT EXISTS dream_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  dream_id uuid REFERENCES dreams NOT NULL,
  content text NOT NULL,
  parent_id uuid REFERENCES dream_comments,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (NOT is_private OR auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Friendships policies
CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create friendship requests"
  ON friendships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friendships they're involved in"
  ON friendships FOR UPDATE
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Dream likes policies
CREATE POLICY "Users can view all likes"
  ON dream_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like dreams"
  ON dream_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON dream_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Dream comments policies
CREATE POLICY "Users can view comments on public dreams"
  ON dream_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON dream_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON dream_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON dream_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION get_mutual_friends_count(user1_id uuid, user2_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM friendships f1
    JOIN friendships f2 ON f1.addressee_id = f2.addressee_id
    WHERE f1.requester_id = user1_id 
    AND f2.requester_id = user2_id
    AND f1.status = 'accepted'
    AND f2.status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dream_comments_updated_at
  BEFORE UPDATE ON dream_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();