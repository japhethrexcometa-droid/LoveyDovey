-- Run these commands in your Supabase SQL Editor to create the necessary tables

-- 1. Capsules Table (For Love Letters)
CREATE TABLE IF NOT EXISTS public.capsules (
    id text PRIMARY KEY,
    title text NOT NULL,
    message text NOT NULL,
    unlock_date timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Moods Table (For Daily Check-in)
CREATE TABLE IF NOT EXISTS public.moods (
    date text PRIMARY KEY, -- Format: YYYY-MM-DD
    mood jsonb NOT NULL,   -- Stores the full mood object { emoji, label, color, score }
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Photos Table (For Gallery Memories)
CREATE TABLE IF NOT EXISTS public.photos (
    id text PRIMARY KEY,
    data text NOT NULL, -- Base64 string for now (Consider Supabase Storage later)
    caption text,
    date bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 4. OJT Logs Table (Optional: If you want to backup logs)
CREATE TABLE IF NOT EXISTS public.farm_logs (
    id text PRIMARY KEY,
    log_text text NOT NULL,
    date text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Note: Ensure Row Level Security (RLS) is disabled if you want the frontend to read/write directly without authentication,
-- OR set up RLS policies allowing anon access for this private app.
-- To disable RLS (easiest for personal project without user login):
ALTER TABLE public.capsules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.moods DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_logs DISABLE ROW LEVEL SECURITY;
