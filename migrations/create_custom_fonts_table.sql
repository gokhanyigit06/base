-- Create custom_fonts table for managing multiple custom fonts
CREATE TABLE IF NOT EXISTS custom_fonts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    font_url TEXT NOT NULL,
    font_family TEXT NOT NULL, -- CSS class name like "font-custom-1"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE custom_fonts ENABLE ROW LEVEL SECURITY;

-- Allow public read access (fonts need to be accessible on frontend)
CREATE POLICY "Allow public read access to custom_fonts"
ON custom_fonts FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert/update/delete (admin only in practice)
CREATE POLICY "Allow authenticated users to manage custom_fonts"
ON custom_fonts FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_custom_fonts_font_family ON custom_fonts(font_family);
