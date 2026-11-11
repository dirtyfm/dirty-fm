# DirtyFM site audit and improvement plan

The audit covers the public homepage, Dirty News feed and article pages, Video Trash, Contact, and the signed-in Signal Control workflow. Public pages were checked on the live site and against the route code. The admin audit also traces the data paths from intake through review, publication, and moderation.

| Area | Finding | Work |
| --- | --- | --- |
| Dirty News review | Publishing generates a new KV ID every time. The submitted item stays in the review list, where the same controls invite a second publish. The old slug suffix also collides when two submissions have the same title. | Give each submission one post identity, keep review history, and send drafts and published files to the post editor. Reject stale attempts to change a completed review. |
| Signal Control feedback | The console gives little indication that a write is running or succeeded. Errors can replace the entire page, and permanent actions sit next to everyday controls. | Show pending, success, and recoverable error states. Preserve edits after errors, include a link to the result, and confirm destructive actions. |
| Admin visibility | The newest eight submissions and posts can hide older pending work and private drafts. Counts and visible rows can disagree. | Show the full pending queue and post inventory. Make completed submissions a separate review history and label draft, public, and archived states. |
| Incoming Signals | Converting a contact signal can create another review item on a repeat. Approval alone is an inbox status. The review notes carry the original read-on-air choice. | Reuse the existing review item when a conversion is repeated. Keep contact-only details and notes in Signal Control. Label the destination of the conversion. |
| Comments and Video Trash | The KV comment-delete action lacked an admin check. Feedback for moderation and video edits was limited. The bundled archive and current clip shelf serve different purposes. | Authorize comment deletion before storage access. Apply console feedback and deletion confirmation. Keep archived source text intact and check clip availability before changing the featured video. |
| Dirty News and Contact | The news intake call to action leads to Contact even though the correct form is on the news page. Category filtering leaves the global featured article in place and the feed repeats its lead item. | Link to the form on the page, mark the selected category for assistive technology, and feature each lead article once. Keep general contact and editorial intake distinct. |
| Home and shared navigation | Homepage data loads sequentially and Video Trash requests the active shelf multiple times per render. Keyboard users must tab through the header before reaching the main content. | Load independent homepage data together, reuse the video shelf within a render, and add a visible-on-focus skip link. Keep the site's existing type, texture, and reduced-motion treatment. |
| Legacy duplicates | Older duplicate posts can have the same public URL and different record IDs. Each can have its own comments. | Show one public card per URL and flag duplicate URLs in the editor. Review each pair and archive the extra record after checking the public URL and comments. |

## Release checks

1. Approve a submission as a draft and confirm it leaves Pending Dirty News and appears in Live Files and Review History. Open the public feed and confirm the draft is private.
2. Publish a submission twice, including overlapping requests. Confirm there is one public URL and one post record. Repeat with two different submissions with the same title and confirm both have their own URLs.
3. Publish a saved draft from the post editor, then archive it. Confirm the public link appears and disappears at the appropriate times and the original submission stays in history.
4. Submit an invalid edit and confirm the page keeps the entered text and shows a useful error. Verify feedback for contact conversion, comment moderation, homepage edits, and video edits.
5. Check mobile and keyboard navigation across all public routes. Confirm that public intake creates pending submissions and public comments remain plain text and subject to admin hide or delete.

## Next pass

- Add search and pagination as the private queues grow. Move the older shared KV indexes for contact intake, comments, and videos away from read-modify-write updates before increasing traffic or allowing several operators to write at once.
- Decide which legacy duplicates to archive after comparing their content and comments. Keep a redirect or the original public URL for any post with external links.
- Inventory featured and archived video playback, replace dead current clips, and give Drift an up-to-date featured transmission. Keep original archive dates, titles, and sources as historical records.
- Add a production smoke check for the public feed and protected console. Keep the active deployment independent of the paused Supabase integration. Exercise the optional Supabase backend with a separate database before reactivating it.
