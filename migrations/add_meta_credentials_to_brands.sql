-- Add Meta/Instagram credentials to brands table
ALTER TABLE public.brands
ADD COLUMN IF NOT EXISTS instagram_business_id TEXT,
ADD COLUMN IF NOT EXISTS meta_access_token TEXT;

-- Security: Update RLS policies to restrict these sensitive fields if needed.
-- For now, since brands are private to agency, existing RLS (Enable read/write for authenticated users) is sufficient for MVP.
