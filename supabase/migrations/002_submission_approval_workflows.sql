-- Approval workflow expansion for existing DirtyFM databases.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'contact_submission_status') then
    create type public.contact_submission_status as enum (
      'pending',
      'approved',
      'rejected',
      'archived',
      'read_on_air'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'post_submission_status') then
    create type public.post_submission_status as enum (
      'pending',
      'approved',
      'rejected',
      'draft',
      'published',
      'archived'
    );
  end if;
end $$;

alter table public.contact_submissions
  alter column status drop default,
  alter column status type public.contact_submission_status
    using status::text::public.contact_submission_status,
  alter column status set default 'pending';

alter table public.post_submissions
  alter column status drop default,
  alter column status type public.post_submission_status
    using status::text::public.post_submission_status,
  alter column status set default 'pending';

drop type if exists public.submission_status;

alter table public.contact_submissions
  add column if not exists admin_notes text;

alter table public.post_submissions
  add column if not exists admin_notes text;
