-- Run this in Supabase SQL Editor for PicklePulse.
-- If your existing Posts table is missing fields, this script adds them safely.

create extension if not exists pgcrypto;

create table if not exists public."Posts" (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null check (char_length(title) > 0 and char_length(title) <= 120),
  post_flag text not null default 'General' check (post_flag in ('General', 'Question', 'Opinion')),
  content text,
  image_url text,
  upvotes integer not null default 0 check (upvotes >= 0),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_email text
);

alter table public."Posts" add column if not exists created_at timestamptz not null default now();
alter table public."Posts" add column if not exists updated_at timestamptz not null default now();
alter table public."Posts" add column if not exists title text;
alter table public."Posts" add column if not exists post_flag text not null default 'General';
alter table public."Posts" add column if not exists content text;
alter table public."Posts" add column if not exists image_url text;
alter table public."Posts" add column if not exists upvotes integer not null default 0;
alter table public."Posts" add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public."Posts" add column if not exists author_email text;

create table if not exists public."Comments" (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public."Posts"(id) on delete cascade,
  created_at timestamptz not null default now(),
  body text not null check (char_length(body) > 0 and char_length(body) <= 800),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_email text
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_posts_updated_at on public."Posts";
create trigger set_posts_updated_at
before update on public."Posts"
for each row execute procedure public.set_updated_at();

alter table public."Posts" enable row level security;
alter table public."Comments" enable row level security;

drop policy if exists "Posts are visible to everyone" on public."Posts";
create policy "Posts are visible to everyone"
on public."Posts"
for select
using (true);

drop policy if exists "Users can create own posts" on public."Posts";
create policy "Users can create own posts"
on public."Posts"
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own posts" on public."Posts";
create policy "Users can update own posts"
on public."Posts"
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own posts" on public."Posts";
create policy "Users can delete own posts"
on public."Posts"
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.increment_post_upvotes(target_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public."Posts"
  set upvotes = upvotes + 1
  where id = target_post_id;
end;
$$;

revoke all on function public.increment_post_upvotes(uuid) from public;
grant execute on function public.increment_post_upvotes(uuid) to authenticated;

drop policy if exists "Comments are visible to everyone" on public."Comments";
create policy "Comments are visible to everyone"
on public."Comments"
for select
using (true);

drop policy if exists "Users can create comments" on public."Comments";
create policy "Users can create comments"
on public."Comments"
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own comments" on public."Comments";
create policy "Users can delete own comments"
on public."Comments"
for delete
to authenticated
using (auth.uid() = user_id);

-- Supabase Storage bucket for local image uploads
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view post images" on storage.objects;
create policy "Public can view post images"
on storage.objects
for select
using (bucket_id = 'post-images');

drop policy if exists "Authenticated can upload post images" on storage.objects;
create policy "Authenticated can upload post images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'post-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can update own post images" on storage.objects;
create policy "Users can update own post images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'post-images'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'post-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can delete own post images" on storage.objects;
create policy "Users can delete own post images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'post-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);
