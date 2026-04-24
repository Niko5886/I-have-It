-- Step 3: Supabase Auth + DB + Storage setup
-- Note: Auth email/password provider is enabled by default in Supabase projects.
-- Email confirmation toggle is configured in the Supabase dashboard (Auth settings), not in SQL migration.

create extension if not exists pgcrypto;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text not null,
  phone_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  location text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  storage_path text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_listings_user_id on public.listings (user_id);
create index if not exists idx_listing_photos_listing_id on public.listing_photos (listing_id);

alter table public.user_profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;

-- user_profiles: users manage only their own profile
create policy "profiles_select_own"
on public.user_profiles
for select
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.user_profiles
for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.user_profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- listings: everyone can view, owner manages own
create policy "listings_select_all"
on public.listings
for select
using (true);

create policy "listings_insert_own"
on public.listings
for insert
with check (auth.uid() = user_id);

create policy "listings_update_own"
on public.listings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "listings_delete_own"
on public.listings
for delete
using (auth.uid() = user_id);

-- listing_photos: everyone can view, listing owner manages own
create policy "listing_photos_select_all"
on public.listing_photos
for select
using (true);

create policy "listing_photos_insert_owner"
on public.listing_photos
for insert
with check (
  exists (
    select 1
    from public.listings l
    where l.id = listing_id
      and l.user_id = auth.uid()
  )
);

create policy "listing_photos_update_owner"
on public.listing_photos
for update
using (
  exists (
    select 1
    from public.listings l
    where l.id = listing_id
      and l.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.listings l
    where l.id = listing_id
      and l.user_id = auth.uid()
  )
);

create policy "listing_photos_delete_owner"
on public.listing_photos
for delete
using (
  exists (
    select 1
    from public.listings l
    where l.id = listing_id
      and l.user_id = auth.uid()
  )
);

-- Storage bucket for listing photos
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

-- Storage policies: everyone can view, listing owners can manage files
create policy "listing_photos_bucket_select_all"
on storage.objects
for select
using (bucket_id = 'listing-photos');

create policy "listing_photos_bucket_insert_owner"
on storage.objects
for insert
with check (
  bucket_id = 'listing-photos'
  and exists (
    select 1
    from public.listings l
    where l.id::text = (storage.foldername(name))[1]
      and l.user_id = auth.uid()
  )
);

create policy "listing_photos_bucket_update_owner"
on storage.objects
for update
using (
  bucket_id = 'listing-photos'
  and exists (
    select 1
    from public.listings l
    where l.id::text = (storage.foldername(name))[1]
      and l.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'listing-photos'
  and exists (
    select 1
    from public.listings l
    where l.id::text = (storage.foldername(name))[1]
      and l.user_id = auth.uid()
  )
);

create policy "listing_photos_bucket_delete_owner"
on storage.objects
for delete
using (
  bucket_id = 'listing-photos'
  and exists (
    select 1
    from public.listings l
    where l.id::text = (storage.foldername(name))[1]
      and l.user_id = auth.uid()
  )
);
