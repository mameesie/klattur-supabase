-- Create profiles table
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  provider TEXT,
  subscription_plan TEXT CHECK (subscription_plan IN ('free', 'premium')) DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create chats table
CREATE TABLE public.chats (
  chat_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create messages table
CREATE TABLE public.messages (
  message_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  text_field TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);
--------------------functions-----------------------------------------------------------------------------------------
-- Function that triggers on creating new account
CREATE OR REPLACE FUNCTION public.handle_new_identity() 
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Get email and name from auth.users
  SELECT 
    email, 
    raw_user_meta_data->>'first_name'
  INTO user_email, user_name
  FROM auth.users
  WHERE id = NEW.user_id;
  
  -- Insert or update profile
  INSERT INTO public.profiles (user_id, name, email, provider)
  VALUES (
    NEW.user_id, 
    user_name,
    user_email,
    NEW.provider
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    provider = EXCLUDED.provider,
    name = EXCLUDED.name,
    email = EXCLUDED.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on identities table
CREATE TRIGGER on_auth_identity_created
  AFTER INSERT ON auth.identities
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_identity();

-- create function that checks if email exists when singing up
CREATE OR REPLACE FUNCTION public.does_email_exist(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_provider TEXT;
  email_confirmed_at TIMESTAMP;
BEGIN
  SELECT p.provider, u.email_confirmed_at INTO user_provider, email_confirmed_at
  FROM public.profiles p
  LEFT JOIN auth.users u ON p.user_id = u.id
  WHERE p.email = user_email
  LIMIT 1;
  
  -- If no user found, return null
  IF user_provider IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- If email is not confirmed (NULL means waiting for verification)
  IF email_confirmed_at IS NULL THEN
    RETURN 'unverified';
  END IF;
  
  -- Otherwise return the provider
  RETURN user_provider;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog, auth;


-- get 10 chats from a user to show in history
CREATE OR REPLACE FUNCTION public.get_user_chats()
RETURNS TABLE (
  chat_id UUID,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- RLS will automatically filter based on auth.uid()
  RETURN QUERY
  SELECT 
    chats.chat_id,
    chats.title,
    chats.created_at,
    chats.updated_at
  FROM public.chats
  WHERE user_id = auth.uid()
  ORDER BY chats.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-------------------end-functions-----------------------------------------------------------------------------------------




-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Security policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Security policy: Users can CRUD their own chats
CREATE POLICY "Users can CRUD own chats"
ON public.chats FOR ALL
USING (auth.uid() = user_id);

-- Security policy: Users can CRUD their own messages
CREATE POLICY "Users can CRUD own messages"
ON public.messages FOR ALL
USING (auth.uid() = user_id);

-- Optimization: Create indexes for efficient queries
CREATE INDEX idx_chats_user_created 
ON public.chats(user_id, created_at DESC);

CREATE INDEX idx_messages_user_created 
ON public.messages(user_id, chat_id, created_at DESC);