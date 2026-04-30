-- Remove old seeded Dirty News posts that should no longer be public.
-- Related comments are removed by the comments.post_id on delete cascade.

delete from public.posts
where slug in (
  'machine-found-another-clipboard',
  'public-access-hell-has-better-standards',
  'open-mic-degeneracy-report-static-edition'
);
