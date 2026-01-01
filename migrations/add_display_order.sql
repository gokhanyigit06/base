-- Add display_order column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Set initial display_order values based on created_at (newest first)
UPDATE projects 
SET display_order = subquery.row_num 
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num 
  FROM projects
) AS subquery 
WHERE projects.id = subquery.id;
