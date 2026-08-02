-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  city text not null default 'Calgary',
  work_status text not null check (work_status in ('citizen', 'pr', 'other')),
  position text not null,
  experience_years integer not null check (experience_years >= 0 and experience_years <= 50),
  available_from date,
  message text,
  resume_path text not null,
  status text not null default 'New' check (status in ('New', 'Reviewing', 'Accepted', 'Rejected')),
  created_at timestamptz not null default now()
);

alter table public.applications enable row level security;

-- Anyone may submit only eligible applications. Public users cannot read them.
create policy "Public can submit eligible applications"
on public.applications for insert
to anon
with check (work_status in ('citizen', 'pr') and status = 'New');

-- Any signed-in owner can read and update. Create only the owner account in Supabase Auth.
create policy "Authenticated owner can read applications"
on public.applications for select
to authenticated
using (true);

create policy "Authenticated owner can update applications"
on public.applications for update
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  5242880,
  array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public applicant can upload a resume into a UUID folder.
create policy "Public can upload resumes"
on storage.objects for insert
to anon
with check (bucket_id = 'resumes');

-- Signed-in owner can view resumes and create signed URLs.
create policy "Authenticated owner can read resumes"
on storage.objects for select
to authenticated
using (bucket_id = 'resumes');

-- Allows cleanup when an application insert fails after upload.
create policy "Public can remove newly uploaded resumes"
on storage.objects for delete
to anon
using (bucket_id = 'resumes');
