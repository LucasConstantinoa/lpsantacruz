-- Run this in the Supabase SQL Editor to prepare your database

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT,
    phone TEXT,
    vehicle TEXT,
    plate TEXT,
    city TEXT,
    date TEXT,
    called BOOLEAN DEFAULT false,
    session_id TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS public.config (
    id INT PRIMARY KEY DEFAULT 1,
    whatsapp TEXT,
    benefits JSONB,
    google_sheets_url TEXT,
    google_sheets_active BOOLEAN DEFAULT false
);

ALTER TABLE public.config ADD COLUMN IF NOT EXISTS "cleanCarImg" TEXT;
ALTER TABLE public.config ADD COLUMN IF NOT EXISTS "crashedCarImg" TEXT;
ALTER TABLE public.config ADD COLUMN IF NOT EXISTS "google_sheets_url" TEXT;
ALTER TABLE public.config ADD COLUMN IF NOT EXISTS "google_sheets_active" BOOLEAN;

-- Turn on row level security to prevent unauthorized access
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;

-- Allow anyone to anonymously insert a lead from the website
DROP POLICY IF EXISTS "Allow public insert to leads" ON public.leads;
CREATE POLICY "Allow public insert to leads" ON public.leads
    FOR INSERT 
    WITH CHECK (true);

-- Allow public to update their own leads (matched by session_id in upsert)
DROP POLICY IF EXISTS "Allow public update to leads" ON public.leads;
CREATE POLICY "Allow public update to leads" ON public.leads
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Allow authenticated admins full control over leads
DROP POLICY IF EXISTS "Allow admins to view leads" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated admins to delete leads" ON public.leads;
DROP POLICY IF EXISTS "Full access for authenticated users" ON public.leads;
CREATE POLICY "Full access for authenticated users" ON public.leads
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Allow authenticated admins to manage config
DROP POLICY IF EXISTS "Allow admins to manage config" ON public.config;
CREATE POLICY "Allow admins to manage config" ON public.config
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Allow public to read config
DROP POLICY IF EXISTS "Allow public read config" ON public.config;
CREATE POLICY "Allow public read config" ON public.config
    FOR SELECT
    USING (true);
