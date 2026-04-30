import { deleteComment, hideComment, restoreComment } from "@/app/signal-control/actions";
import type { AdminDashboardComment } from "@/lib/db/adminDashboard";
import { EmptyWire } from "./EmptyWire";
import { excerpt, formatDate } from "./shared";

export function CommentList({ comments }: { comments: AdminDashboardComment[] }) {
  if (comments.length === 0) {
    return <EmptyWire label="open mic comments" />;
  }

  return (
    <div className="grid gap-3">
      {comments.map((comment) => (
        <article className="border border-[rgba(183,178,168,0.24)] bg-dirty-black/50 p-4" key={comment.id}>
          <div className="flex flex-col gap-2 min-[760px]:flex-row min-[760px]:items-start min-[760px]:justify-between">
            <div>
              <p className="card-label">{comment.is_hidden ? "Hidden" : "Live Comment"}</p>
              <h3 className="mt-2 text-xl font-black uppercase leading-tight text-dirty-ash">
                {comment.author_name}
              </h3>
            </div>
            <p className="font-utility text-xs font-bold uppercase text-dirty-yellow">
              {formatDate(comment.created_at)}
            </p>
          </div>
          <p className="mt-2 text-sm text-dirty-gray">On: {comment.postTitle}</p>
          <p className="mt-3 text-dirty-ash">{excerpt(comment.body)}</p>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-[rgba(183,178,168,0.24)] pt-4">
            {comment.is_hidden ? (
              <form action={restoreComment}>
                <input name="id" type="hidden" value={comment.id} />
                <button className="button button-secondary" type="submit">
                  Restore Comment
                </button>
              </form>
            ) : (
              <form action={hideComment}>
                <input name="id" type="hidden" value={comment.id} />
                <button className="button button-secondary" type="submit">
                  Hide Comment
                </button>
              </form>
            )}
            <form action={deleteComment}>
              <input name="id" type="hidden" value={comment.id} />
              <button className="danger-link" type="submit">
                Delete Comment
              </button>
            </form>
          </div>
        </article>
      ))}
    </div>
  );
}
