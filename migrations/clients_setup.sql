-- Create clients table
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text, -- optimized for logo images
  description text,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.clients enable row level security;

-- Policy for reading (public)
create policy "Clients are viewable by everyone"
  on public.clients for select
  using ( true );

-- Policy for modifications (authenticated only - ideally admins)
-- For now allowing all authenticated users as per previous pattern, or just matching existing policies.
create policy "Authenticated users can insert clients"
  on public.clients for insert
  with check ( auth.role() = 'authenticated' );

create policy "Authenticated users can update clients"
  on public.clients for update
  using ( auth.role() = 'authenticated' );

create policy "Authenticated users can delete clients"
  on public.clients for delete
  using ( auth.role() = 'authenticated' );

-- Storage bucket for client logos if not exists
insert into storage.buckets (id, name, public)
values ('client-logos', 'client-logos', true)
on conflict (id) do nothing;

-- Storage policy
create policy "Client logos are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'client-logos' );

create policy "Authenticated users can upload client logos"
  on storage.objects for insert
  with check ( bucket_id = 'client-logos' and auth.role() = 'authenticated' );

create policy "Authenticated users can update client logos"
  on storage.objects for update
  using ( bucket_id = 'client-logos' and auth.role() = 'authenticated' );

create policy "Authenticated users can delete client logos"
  on storage.objects for delete
  using ( bucket_id = 'client-logos' and auth.role() = 'authenticated' );
