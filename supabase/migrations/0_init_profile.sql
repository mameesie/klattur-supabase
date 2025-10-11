CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  subscription_plan TEXT CHECK (subscription_plan IN ('free', 'premium')) DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);



-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create conversations table
CREATE TABLE chats (
    chat_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE messages (
  message_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats ON DELETE CASCADE, -- don't need to explicitly say public.chats(chat_id) bc it is the primary key
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  text_field TEXT NOT NULL,
  created_at timestamp with time zone default timezone('utc'::text, now())

);



-- Function to create profile for new (auth) users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create profile for new public table users after auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Security policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Security policy: Users can CRUD their own chats
CREATE POLICY "Users can CRUD own tasks"
ON public.chats FOR ALL
USING (auth.uid() = user_id);

-- create the same for messages
-- Security policy: Users can CRUD their own chats
CREATE POLICY "Users can CRUD own tasks"
ON public.messages FOR ALL
USING (auth.uid() = user_id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Optimization: Create an index on user_id and created_at to list tasks efficiently
CREATE INDEX idx_chats_user_created 
ON public.chats(user_id, created_at DESC);