-- DirtyFM database/auth foundation for Supabase.
-- Run this in the Supabase SQL editor or through the Supabase CLI.

create extension if not exists pgcrypto;

create type public.contact_submission_status as enum ('pending', 'approved', 'rejected', 'archived', 'read_on_air');
create type public.post_submission_status as enum ('pending', 'approved', 'rejected', 'draft', 'published', 'archived');
create type public.post_status as enum ('draft', 'published', 'archived');
create type public.admin_role as enum ('admin', 'editor');

create table public.admin_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.admin_role not null default 'editor',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  submission_type text not null,
  message text not null,
  attachment_url text,
  can_read_on_air boolean not null default false,
  status public.contact_submission_status not null default 'pending',
  admin_notes text,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint contact_submission_name_length check (char_length(name) between 1 and 120),
  constraint contact_submission_email_shape check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  constraint contact_submission_subject_length check (char_length(subject) between 1 and 160),
  constraint contact_submission_type_allowed check (
    submission_type in (
      'Show Tip',
      'Open Mic Rant',
      'Guest Request',
      'Hate Mail',
      'Business / Booking',
      'Video Clip',
      'Technical Problem',
      'Other Bullshit'
    )
  ),
  constraint contact_submission_message_length check (char_length(message) between 20 and 6000),
  constraint contact_submission_attachment_url_shape check (
    attachment_url is null or attachment_url ~* '^https?://'
  )
);

create table public.post_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  title text not null,
  category text not null,
  body text not null,
  source_url text,
  status public.post_submission_status not null default 'pending',
  admin_notes text,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint post_submission_name_length check (char_length(name) between 1 and 120),
  constraint post_submission_email_shape check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  constraint post_submission_title_length check (char_length(title) between 6 and 180),
  constraint post_submission_category_allowed check (
    category in (
      'Dirty News',
      'Rants',
      'Prank Calls',
      'The Drift Files',
      'Fuck the Machine',
      'Open Mic',
      'Video Drops',
      'Public Access Hell',
      'Government Bullshit',
      'Random Fucking Bullshit'
    )
  ),
  constraint post_submission_body_length check (char_length(body) between 80 and 20000),
  constraint post_submission_source_url_shape check (
    source_url is null or source_url ~* '^https?://'
  )
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  body text not null,
  category text not null,
  author text not null default 'DirtyFM Desk',
  featured_image_url text,
  status public.post_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_posts_need_date check (status <> 'published' or published_at is not null)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_name text not null,
  author_email text,
  body text not null,
  is_hidden boolean not null default false,
  hidden_by uuid references auth.users (id) on delete set null,
  hidden_at timestamptz,
  created_at timestamptz not null default now(),
  constraint comment_author_name_length check (char_length(author_name) between 1 and 120),
  constraint comment_author_email_shape check (
    author_email is null or author_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  constraint comment_body_length check (char_length(body) between 8 and 4000)
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  youtube_id text not null unique,
  description text not null,
  category text not null,
  status text not null default 'archive file',
  host text not null default 'Drift',
  is_featured boolean not null default false,
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contact_submissions_status_created_at_idx on public.contact_submissions (status, created_at desc);
create index post_submissions_status_created_at_idx on public.post_submissions (status, created_at desc);
create index posts_status_published_at_idx on public.posts (status, published_at desc);
create index comments_post_visible_created_at_idx on public.comments (post_id, is_hidden, created_at desc);
create index videos_published_at_idx on public.videos (published_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger admin_profiles_touch_updated_at
before update on public.admin_profiles
for each row execute function public.touch_updated_at();

create trigger posts_touch_updated_at
before update on public.posts
for each row execute function public.touch_updated_at();

create trigger videos_touch_updated_at
before update on public.videos
for each row execute function public.touch_updated_at();

create or replace function public.is_dirtyfm_admin(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = check_user_id
      and role in ('admin', 'editor')
  );
$$;

alter table public.admin_profiles enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.post_submissions enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.videos enable row level security;

create policy "Admins can read admin profiles"
on public.admin_profiles for select
to authenticated
using (public.is_dirtyfm_admin(auth.uid()));

create policy "Admins can manage admin profiles"
on public.admin_profiles for all
to authenticated
using (public.is_dirtyfm_admin(auth.uid()))
with check (public.is_dirtyfm_admin(auth.uid()));

create policy "Public can create pending contact submissions"
on public.contact_submissions for insert
to anon, authenticated
with check (
  status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
);

create policy "Admins can manage contact submissions"
on public.contact_submissions for all
to authenticated
using (public.is_dirtyfm_admin(auth.uid()))
with check (public.is_dirtyfm_admin(auth.uid()));

create policy "Public can create pending post submissions"
on public.post_submissions for insert
to anon, authenticated
with check (
  status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
);

create policy "Admins can manage post submissions"
on public.post_submissions for all
to authenticated
using (public.is_dirtyfm_admin(auth.uid()))
with check (public.is_dirtyfm_admin(auth.uid()));

create policy "Published posts are public"
on public.posts for select
to anon, authenticated
using (status = 'published' and published_at <= now());

create policy "Admins can manage posts"
on public.posts for all
to authenticated
using (public.is_dirtyfm_admin(auth.uid()))
with check (public.is_dirtyfm_admin(auth.uid()));

create policy "Visible comments on published posts are public"
on public.comments for select
to anon, authenticated
using (
  is_hidden = false
  and exists (
    select 1
    from public.posts
    where posts.id = comments.post_id
      and posts.status = 'published'
      and posts.published_at <= now()
  )
);

create policy "Public can comment on published posts"
on public.comments for insert
to anon, authenticated
with check (
  is_hidden = false
  and hidden_by is null
  and hidden_at is null
  and exists (
    select 1
    from public.posts
    where posts.id = comments.post_id
      and posts.status = 'published'
      and posts.published_at <= now()
  )
);

create policy "Admins can manage comments"
on public.comments for all
to authenticated
using (public.is_dirtyfm_admin(auth.uid()))
with check (public.is_dirtyfm_admin(auth.uid()));

create policy "Videos are public"
on public.videos for select
to anon, authenticated
using (published_at is not null and published_at <= now());

create policy "Admins can manage videos"
on public.videos for all
to authenticated
using (public.is_dirtyfm_admin(auth.uid()))
with check (public.is_dirtyfm_admin(auth.uid()));
