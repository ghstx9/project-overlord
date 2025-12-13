-- Database Setup
-- Run `setup.sql` file in Supabase SQL Editor to initialize tables, RLS and storage.



-- Create the posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT, -- Markdown or HTML content
  excerpt TEXT,
  cover_image TEXT,
  view_count INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access to all posts (or just published ones)
-- For now, we allow reading all posts to make development easier, 
-- but in production you might want: published = true
CREATE POLICY "Public can view all posts" 
ON posts FOR SELECT 
USING (true);

-- Policy 2: Allow authenticated users (admins) to modify posts
-- This assumes you will use Supabase Auth and your user is authenticated
CREATE POLICY "Authenticated users can modify posts" 
ON posts FOR ALL 
USING ((select auth.role()) = 'authenticated');

-- Create a storage bucket for post images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'images' );

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'images' AND auth.role() = 'authenticated' );

-- public.admin_profiles
create table public.admin_profiles (
  id uuid not null,
  display_name text null,
  role text null default 'editor'::text,
  avatar_url text null,
  bio text null,
  created_at timestamp with time zone null default now(),
  last_login_at timestamp with time zone null,
  updated_at timestamp with time zone null default now(),
  constraint admin_profiles_pkey primary key (id),
  constraint admin_profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint admin_profiles_role_check check (
    (
      role = any (
        array['admin'::text, 'editor'::text, 'viewer'::text]
      )
    )
  )
) TABLESPACE pg_default;

create trigger set_updated_at BEFORE
update on admin_profiles for EACH row
execute FUNCTION handle_updated_at ();

-- public.activity_logs
create table public.activity_logs (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  action text not null,
  resource_type text null,
  resource_id uuid null,
  metadata jsonb null,
  created_at timestamp with time zone null default now(),
  constraint activity_logs_pkey primary key (id),
  constraint activity_logs_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists activity_logs_user_id_idx on public.activity_logs using btree (user_id) TABLESPACE pg_default;

create index IF not exists activity_logs_created_at_idx on public.activity_logs using btree (created_at desc) TABLESPACE pg_default;

create index IF not exists activity_logs_action_idx on public.activity_logs using btree (action) TABLESPACE pg_default;
