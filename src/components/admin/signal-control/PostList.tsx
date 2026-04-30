import Link from "next/link";
import type { AdminDashboardPost } from "@/lib/db/adminDashboard";
import { EmptyWire } from "./EmptyWire";
import { formatDate } from "./shared";

export function PostList({ posts }: { posts: AdminDashboardPost[] }) {
  if (posts.length === 0) {
    return <EmptyWire label="live files" />;
  }

  return (
    <div className="grid gap-3">
      {posts.map((post) => (
        <article
          className="grid gap-3 border border-[rgba(183,178,168,0.24)] bg-dirty-coal/70 p-4 min-[760px]:grid-cols-[minmax(0,1fr)_12rem]"
          key={post.id}
        >
          <div>
            <p className="card-label">{post.category}</p>
            <h3 className="mt-2 text-xl font-black uppercase leading-tight text-dirty-ash">
              {post.title}
            </h3>
            <p className="mt-1 text-sm text-dirty-gray">
              {post.author} / {post.status} / {formatDate(post.published_at)}
            </p>
          </div>
          <Link className="button button-secondary self-start" href={`/dirty-news/${post.slug}`}>
            Open File
          </Link>
        </article>
      ))}
    </div>
  );
}
