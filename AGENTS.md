# DirtyFM Agent Guide

## 1. Project overview

DirtyFM is a Next.js site for Erik Woods / Drift, built as a raw internet-radio, video, and Dirty News archive. Before any task involving UI, layout, copy, components, or routes, read `docs/brand.md`; it is the brand source of truth.

This repo uses Next.js App Router with TypeScript and Tailwind CSS. Re-check `package.json`, lockfiles, and route structure before starting work because the app may evolve.

## 2. Brand rules

- Treat `docs/brand.md` as authoritative for voice, positioning, section language, and tone boundaries.
- Do not duplicate or drift away from the brand direction in that file.
- Keep the site raw, loud, messy, and readable.
- Do not make the site clean, corporate, generic, influencer-like, podcast-bro, campaign-like, conspiracy-template, or SaaS-like.

## 3. Visual identity

- Use the palette, typography direction, texture language, and component mood from `docs/brand.md`.
- Favor dirty broadcast, punk flyer, VHS/static, archive-file, and vandalized dossier treatments.
- Preserve usability: text must remain legible, navigation obvious, controls accessible, and layouts responsive.
- Avoid polished startup gradients, sterile white space, glossy cards, or generic dark-mode media styling.

## 4. Routes

Planned main routes:

- `/` - Home / Signal page
- `/news` - Dirty News feed
- `/news/[slug]` - individual Dirty News post with comments
- `/tv` - Dirty TV / YouTube video archive
- `/contact` - Send a Signal page
- `/signal-control` or another unlisted admin route - Signal Control admin area

Use Next.js App Router if the repo is scaffolded that way. Keep route names blunt, readable, and aligned with `docs/brand.md`.

## 5. Data/content flows

- Blog/news posts may start as local content or static data until a database/CMS is introduced.
- Video archive data may start as local YouTube metadata until a YouTube API integration is introduced.
- Comments should be user-submitted but not allowed to publish posts directly.
- Comments do not require pre-approval by default, but admin tools must allow hiding/deleting comments.
- Never render user-submitted raw HTML. Sanitize or render plain text/Markdown through a safe pipeline only.

## 6. Admin/security rules

- Do not rely on an unlisted admin URL as security.
- Do not implement real admin features without authentication and authorization.
- Do not expose secrets to the client. Keep private values server-only.
- Public users must never be able to publish posts directly.
- Treat Signal Control as protected admin space once implemented.

## 7. Coding conventions

- Follow the existing Next.js App Router, TypeScript, and Tailwind CSS conventions.
- Prefer existing components, helpers, styles, and patterns over introducing new abstractions.
- Do not introduce unnecessary dependencies.
- Keep copy and component names consistent with the DirtyFM vocabulary in `docs/brand.md`.
- Tests should be created when needed, especially for content parsing, comment handling, admin actions, and shared UI behavior.
- Created or affected tests must pass before work is complete.

## 8. Commands to run

Package manager: npm, unless a different lockfile is added later.

Available scripts:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`

There is no test script yet. Do not invent one. If tests are added later, update `package.json` and this section.

Run the relevant lint, type, build, and test checks for the files changed.

## 9. Definition of done

- `docs/brand.md` was checked for any task touching UI, layout, copy, components, or routes.
- Changes match DirtyFM's brand and remain readable/usable.
- Relevant lint/type/build/test checks pass.
- Created or affected tests pass.
- Admin, comment, and content flows respect the security rules above.
- No secrets, unsafe HTML rendering, or public post-publishing paths were introduced.

## 10. Do-not rules

- Do not make the site clean, corporate, generic, influencer-like, or SaaS-like.
- Do not ignore `docs/brand.md` on brand-facing work.
- Do not rely on an unlisted admin URL as security.
- Do not expose secrets to the client.
- Do not render user-submitted raw HTML.
- Do not let public users publish posts directly.
- Do not require approval for comments, but do allow admin hide/delete.
- Do not invent package scripts or commands that are not in `package.json`.
- Do not add dependencies unless they are clearly needed.
