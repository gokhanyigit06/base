-- Migrate old custom_font_url from site_settings to custom_fonts table
-- This script will run once to migrate existing font to new system

DO $$
DECLARE
    old_font_url TEXT;
BEGIN
    -- Get the old custom font URL from site_settings
    SELECT value INTO old_font_url
    FROM site_settings
    WHERE key = 'custom_font_url'
    AND value IS NOT NULL
    AND value != '';

    -- If a custom font exists, migrate it to custom_fonts table
    IF old_font_url IS NOT NULL THEN
        -- Check if it's not already migrated
        IF NOT EXISTS (
            SELECT 1 FROM custom_fonts WHERE font_url = old_font_url
        ) THEN
            INSERT INTO custom_fonts (name, font_url, font_family)
            VALUES (
                'Legacy Custom Font',
                old_font_url,
                'font-custom-legacy'
            );
            
            RAISE NOTICE 'Migrated legacy custom font to new system';
        ELSE
            RAISE NOTICE 'Legacy font already exists in custom_fonts table';
        END IF;
    ELSE
        RAISE NOTICE 'No legacy custom font found to migrate';
    END IF;
END $$;
