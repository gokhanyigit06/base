-- 1. Create Projects Table
create table projects (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  category text, -- Can be comma separated or single
  subheading text,
  description text,
  year text,
  client text,
  services text,
  cover_image text, -- URL to the image
  content jsonb default '[]'::jsonb, -- Array of content blocks
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (Security best practice)
alter table projects enable row level security;

-- 3. Create Policy: Everyone can READ projects
create policy "Public projects are viewable by everyone"
  on projects for select
  using ( true );

-- 4. Create Policy: Everyone can INSERT/UPDATE (For dev simplicity, normally strictly authenticated)
create policy "Anyone can insert projects"
  on projects for insert
  with check ( true );

create policy "Anyone can update projects"
  on projects for update
  using ( true );

create policy "Anyone can delete projects"
  on projects for delete
  using ( true );

-- 5. Create Storage Bucket for Images
insert into storage.buckets (id, name, public)
values ('project-assets', 'project-assets', true);

-- 6. Storage Policy: Public Read
create policy "Give public access to project-assets"
  on storage.objects for select
  using ( bucket_id = 'project-assets' );

-- 7. Storage Policy: Public Upload/Delete (Again, for dev simplicity)
create policy "Allow public upload to project-assets"
  on storage.objects for insert
  with check ( bucket_id = 'project-assets' );

create policy "Allow public delete in project-assets"
  on storage.objects for delete
  using ( bucket_id = 'project-assets' );

-- 8. Add 'is_featured' column for Homepage Selection
alter table projects add column is_featured boolean default false;

-- Create Site Settings Table
create table site_settings (
    key text primary key,
    value text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table site_settings enable row level security;

create policy "Enable read access for all users"
on "public"."site_settings"
as permissive
for select
to public
using (true);

create policy "Enable insert/update for anon (for dev only - restrict in prod)"
on "public"."site_settings"
as permissive
for all
to anon
using (true)
with check (true);
