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

)