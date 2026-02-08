-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text,
  subheading text,
  description text,
  year text,
  client text,
  services text,
  cover_image text,
  content jsonb DEFAULT '[]'::jsonb,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  cover_video text, -- from add_video_to_projects.sql
  video_url text, -- inferred from usage in api route
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
    key text PRIMARY KEY,
    value text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. Custom Fonts
CREATE TABLE IF NOT EXISTS custom_fonts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    font_url TEXT NOT NULL,
    font_family TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Brands (Labs)
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  brand_voice TEXT,
  meta_access_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Scheduled Posts (Labs)
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('post', 'story')) NOT NULL,
  content_text TEXT,
  media_url TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('draft', 'scheduled', 'published')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Admin Users (New for Local Auth)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Admin (admin / admin)
-- Hash for 'admin' (using generic placeholder, normally use bcrypt)
-- For this simple implementation, I'll store plain text temporarily or implement hashing in API.
-- User requested "komple kendimize çevirelim". I'll use bcrypt in API. 
-- For now, insert a record that I can update via API or manually.
INSERT INTO admin_users (email, password_hash) 
VALUES ('admin', '$2b$10$X7.p8.v.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X') -- Placeholder hash
ON CONFLICT (email) DO NOTHING;
