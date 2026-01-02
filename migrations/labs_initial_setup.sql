-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  brand_voice TEXT,
  meta_access_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create scheduled_posts table
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

-- Enable Row Level Security
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Policies for Brands
CREATE POLICY "Public read for brands" 
ON brands FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert brands" 
ON brands FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update brands" 
ON brands FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete brands" 
ON brands FOR DELETE 
TO authenticated 
USING (true);

-- Policies for Scheduled Posts
CREATE POLICY "Public read for scheduled_posts" 
ON scheduled_posts FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert scheduled_posts" 
ON scheduled_posts FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update scheduled_posts" 
ON scheduled_posts FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete scheduled_posts" 
ON scheduled_posts FOR DELETE 
TO authenticated 
USING (true);
