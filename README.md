# DirtyFM

DirtyFM is a raw internet-radio, video, and Dirty News archive for Drift. It is built like a dirty pirate broadcast desk: public pages for the signal, videos, news, and contact intake, plus a protected Signal Control admin area for managing the archive.

Before changing UI, routes, public copy, or visual components, read `docs/brand.md`. That file is the source of truth for the DirtyFM voice: raw, loud, messy, readable, anti-polish, and not corporate.

## What It Uses

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Vercel for the current production hosting target
- Cloudflare KV as the active content backend in production
- Cloudflare KV REST API when running on Vercel
- Local Signal Control auth for the active production auth mode
- GitHub for source control and deployment workflow
- Supabase code remains in the repo as a future backend/auth option, but it is not the active production path right now

## What The Site Does

- `/` serves the main DirtyFM signal page.
- `/dirty-tv` serves the Dirty TV / video archive.
- `/dirty-news` serves Dirty News posts.
- `/dirty-news/[slug]` serves individual posts and comments.
- `/contact` lets public users send a signal/contact submission.
- `/signal-control` is the protected admin console for incoming signals, pending news submissions, posts, videos, homepage copy, and comments.

Public users can submit contact messages and Dirty News submissions, but they cannot directly publish posts. User-submitted content must never be rendered as raw HTML.

## Current Production Setup

Production is hosted on Vercel.

The active auth mode is:

```text
DIRTYFM_AUTH_MODE=local
```

The active content backend is:

```text
DIRTYFM_CONTENT_BACKEND=cloudflare-kv
```

On Vercel, Cloudflare KV is accessed through Cloudflare's REST API. These server-side environment variables are required there:

```text
DIRTYFM_OPERATOR_EMAIL
DIRTYFM_OPERATOR_PASSPHRASE_HASH
DIRTYFM_SESSION_SECRET
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_KV_NAMESPACE_ID
CLOUDFLARE_API_TOKEN
```

Supabase variables may exist for future backend work, but production should not unexpectedly use Supabase while `DIRTYFM_CONTENT_BACKEND=cloudflare-kv`.

## Cloudflare Notes

The repo includes `wrangler.jsonc` for Cloudflare/OpenNext deployment experiments. It defines a `DIRTYFM_CONTENT` KV binding for Cloudflare Workers style deployments.

When hosted on Vercel, there is no Workers KV binding. The app uses:

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_KV_NAMESPACE_ID
CLOUDFLARE_API_TOKEN
```

to read and write Cloudflare KV through REST.

## GitHub And Deploys

The project is intended to live in GitHub and deploy through Vercel from the GitHub repo. Normal flow:

1. Make changes locally.
2. Run the relevant checks.
3. Commit to GitHub.
4. Let Vercel build and deploy from the connected GitHub branch/project.

Keep secrets in Vercel environment variables, not in the repo.

## Local Development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Build locally:

```bash
npm run build
```

Start a built app:

```bash
npm run start
```

Lint:

```bash
npm run lint
```

Typecheck:

```bash
npm run typecheck
```

Run the existing Node test suite:

```bash
npm run test
```

The package-level test script uses Node's built-in test runner with `--experimental-test-isolation=none` because the existing `.mjs` tests import TypeScript files directly and run reliably in one process.

Run the full local completion gate:

```bash
npm run check
```

## Environment File

Copy `.env.example` for local setup and fill in only what your current mode needs.

For the current Vercel production shape:

```text
DIRTYFM_AUTH_MODE=local
DIRTYFM_CONTENT_BACKEND=cloudflare-kv
```

Use local operator credentials for Signal Control and Cloudflare KV REST credentials for content storage.

## Backend Switches

Content backend selection lives in `src/lib/contentBackend.ts`.

- `cloudflare-kv` uses `src/lib/kv/*`.
- `supabase` uses `src/lib/db/*`.

Auth mode selection lives in `src/lib/authMode.ts`.

- `local` uses local Signal Control auth.
- `supabase` uses Supabase auth/admin profile checks.

Keep both paths available unless a future migration intentionally removes one.

## Security Rules

- Do not expose secrets to the client.
- Do not put private values in `NEXT_PUBLIC_*`.
- Do not rely on an unlisted admin URL as security.
- Do not implement admin mutations without authentication and authorization.
- Public users must never publish posts directly.
- Never render user-submitted raw HTML.
- Comments can be visible by default, but admin tools must allow hiding/deleting them.

## Brand Rules

DirtyFM should feel like pirate radio, corrupted broadcast, punk flyer, late-night VHS, and a vandalized dossier. Keep it loud and usable.

Do not make it clean, corporate, generic, SaaS-like, podcast-bro, campaign-like, or polished startup dark mode.
