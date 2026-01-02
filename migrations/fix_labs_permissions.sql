-- Tabloların var olduğundan emin ol
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  brand_voice TEXT,
  meta_access_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

-- Geliştirme modu: RLS'i tamamen kapat (Herkes okuyabilir/yazabilir)
-- Not: Canlıya alırken bunu tekrar açacağız!
ALTER TABLE brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts DISABLE ROW LEVEL SECURITY;

-- Varsa eski politikaları temizleyelim (kafa karıştırmasın)
DROP POLICY IF EXISTS "Public read for brands" ON brands;
DROP POLICY IF EXISTS "Authenticated users can insert brands" ON brands;
