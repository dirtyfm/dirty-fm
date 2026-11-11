import Link from "next/link";
import { SignalControlForm } from "./SignalControlForms";
import { postSubmissionCategories } from "@/lib/contentValidation";
import type { AdminDashboardPost } from "@/lib/db/adminDashboard";
import { getLegacyAttachmentUrl } from "@/lib/videoAttachments";
import { adminFieldBase } from "./shared";

export function PostEditorList({ posts }: { posts: AdminDashboardPost[] }) {
  const urlCounts = new Map<string, number>();
  for (const post of posts) {
    if (post.status === "published") urlCounts.set(post.slug, (urlCounts.get(post.slug) ?? 0) + 1);
  }
  const groups = [
    { status: "draft", label: "Drafts" },
    { status: "published", label: "Published and scheduled" },
    { status: "archived", label: "Archived files" }
  ];
  return (
    <div className="grid gap-4">
      <SignalControlForm key={posts.length} operation="save-post" className="archive-card grid gap-3">
        <input name="request_id" type="hidden" defaultValue={`file-${crypto.randomUUID()}`} />
        <p className="card-label">Create Dirty News File</p>
        <div className="grid gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_13rem_10rem]">
          <input aria-label="Title" className={adminFieldBase} name="title" placeholder="Title" required />
          <select aria-label="Category" className={adminFieldBase} defaultValue="Dirty News" name="category">
            {postSubmissionCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select aria-label="Status" className={adminFieldBase} defaultValue="draft" name="status">
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </div>
        <textarea aria-label="Body" className={adminFieldBase} name="body" placeholder="Body" rows={5} required />
        <div className="grid gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <input aria-label="Author" className={adminFieldBase} name="author" placeholder="Author" defaultValue="DirtyFM Desk" />
          <input aria-label="Excerpt override" className={adminFieldBase} name="excerpt" placeholder="Excerpt override" />
        </div>
        <button className="button button-primary justify-self-start" type="submit">
          File New Post
        </button>
      </SignalControlForm>

      {groups.map(({ status, label }) => {
        const files = posts.filter((post) => post.status === status);
        if (files.length === 0) return null;
        return <section className="grid gap-3" key={status}>
          <h3 className="font-display text-3xl uppercase text-dirty-ash">{label} ({files.length})</h3>
          {files.map((post) => (
        <details className="archive-card scroll-mt-24" id={`post-${post.id}`} key={post.id}>
          <summary className="cursor-pointer font-display text-2xl uppercase text-dirty-ash">{post.title}</summary>
          {(urlCounts.get(post.slug) ?? 0) > 1 && post.status === "published" ? (
            <p className="mt-2 text-dirty-yellow">Another published file shares this URL.</p>
          ) : null}
          <SignalControlForm operation="save-post" className="mt-4 grid gap-3">
            <input name="id" type="hidden" value={post.id} />
            <div className="grid gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_13rem_10rem]">
              <input aria-label="Title" className={adminFieldBase} defaultValue={post.title} name="title" required />
              <select aria-label="Category" className={adminFieldBase} defaultValue={post.category} name="category">
                {postSubmissionCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select aria-label="Status" className={adminFieldBase} defaultValue={post.status} name="status">
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
            </div>
            <input aria-label="Post URL slug" className={adminFieldBase} defaultValue={post.slug} name="slug" required />
            <div className="grid gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <input aria-label="Author" className={adminFieldBase} defaultValue={post.author} name="author" />
              <input aria-label="Publication date" className={adminFieldBase} defaultValue={post.published_at ?? ""} name="published_at" placeholder="Publication date (blank for now)" />
            </div>
            <textarea aria-label="Body" className={adminFieldBase} defaultValue={post.body} name="body" rows={4} required />
            <input aria-label="Excerpt override" className={adminFieldBase} defaultValue={post.excerpt} name="excerpt" placeholder="Excerpt override" />
            <label className="grid gap-1">
              <span className="font-utility text-xs font-black uppercase text-dirty-yellow">Source URL</span>
              <input
                className={adminFieldBase}
                defaultValue={post.review_source_url === undefined ? getLegacyAttachmentUrl(post.body) : post.review_source_url ?? ""}
                name="source_url"
                type="url"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button className="button button-secondary" type="submit">Save Post</button>
              {post.status === "published" && post.published_at && Date.parse(post.published_at) <= Date.now() ? (
                <Link className="button button-secondary" href={`/dirty-news/${encodeURIComponent(post.slug)}`}>View Public Post</Link>
              ) : null}
            </div>
          </SignalControlForm>
          <SignalControlForm operation="delete-post" confirmation="Permanently delete this Dirty News file?" className="mt-3">
            <input name="id" type="hidden" value={post.id} />
            <button className="danger-link" type="submit">Delete Post</button>
          </SignalControlForm>
        </details>
          ))}
        </section>;
      })}
    </div>
  );
}
