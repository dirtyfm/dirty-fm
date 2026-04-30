import Link from "next/link";
import { deletePost, savePost } from "@/app/signal-control/actions";
import { postSubmissionCategories } from "@/lib/contentValidation";
import type { AdminDashboardPost } from "@/lib/db/adminDashboard";
import { adminFieldBase } from "./shared";

export function PostEditorList({ posts }: { posts: AdminDashboardPost[] }) {
  return (
    <div className="grid gap-4">
      <form action={savePost} className="archive-card grid gap-3">
        <p className="card-label">Create Dirty News File</p>
        <div className="grid gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_13rem_10rem]">
          <input className={adminFieldBase} name="title" placeholder="Title" />
          <select className={adminFieldBase} defaultValue="Dirty News" name="category">
            {postSubmissionCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select className={adminFieldBase} defaultValue="draft" name="status">
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </div>
        <textarea className={adminFieldBase} name="body" placeholder="Body" rows={5} />
        <div className="grid gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <input className={adminFieldBase} name="author" placeholder="Author" defaultValue="DirtyFM Desk" />
          <input className={adminFieldBase} name="excerpt" placeholder="Excerpt override" />
        </div>
        <button className="button button-primary justify-self-start" type="submit">
          File New Post
        </button>
      </form>

      {posts.map((post) => (
        <article className="archive-card" key={post.id}>
          <form action={savePost} className="grid gap-3">
            <input name="id" type="hidden" value={post.id} />
            <div className="grid gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_13rem_10rem]">
              <input className={adminFieldBase} defaultValue={post.title} name="title" />
              <select className={adminFieldBase} defaultValue={post.category} name="category">
                {postSubmissionCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select className={adminFieldBase} defaultValue={post.status} name="status">
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
            </div>
            <input className={adminFieldBase} defaultValue={post.slug} name="slug" />
            <div className="grid gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <input className={adminFieldBase} defaultValue={post.author} name="author" />
              <input className={adminFieldBase} defaultValue={post.published_at ?? ""} name="published_at" />
            </div>
            <textarea className={adminFieldBase} defaultValue={post.body} name="body" rows={4} />
            <input className={adminFieldBase} defaultValue={post.excerpt} name="excerpt" placeholder="Excerpt override" />
            <div className="flex flex-wrap gap-2">
              <button className="button button-secondary" type="submit">Save Post</button>
              <Link className="button button-secondary" href={`/dirty-news/${post.slug}`}>Open File</Link>
            </div>
          </form>
          <form action={deletePost} className="mt-3">
            <input name="id" type="hidden" value={post.id} />
            <button className="danger-link" type="submit">Delete Post</button>
          </form>
        </article>
      ))}
    </div>
  );
}
