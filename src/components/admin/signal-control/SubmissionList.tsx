import {
  deletePostSubmission,
  publishPostSubmission,
  updatePostSubmission
} from "@/app/signal-control/actions";
import { postSubmissionCategories } from "@/lib/contentValidation";
import type { AdminDashboardPostSubmission } from "@/lib/db/adminDashboard";
import { postSubmissionStatuses } from "@/lib/submissionWorkflows";
import { EmptyWire } from "./EmptyWire";
import { adminFieldBase, excerpt, formatDate } from "./shared";

export function SubmissionList({ submissions }: { submissions: AdminDashboardPostSubmission[] }) {
  if (submissions.length === 0) {
    return <EmptyWire label="pending Dirty News submissions" />;
  }

  return (
    <div className="grid gap-3">
      {submissions.map((submission) => (
        <article className="archive-card" key={submission.id}>
          <p className="card-label">{submission.category}</p>
          <h3 className="mt-2 font-display text-3xl font-black uppercase leading-none text-dirty-ash">
            {submission.title}
          </h3>
          <p className="mt-3 text-sm text-dirty-gray">
            {submission.name} / {submission.email} / {formatDate(submission.created_at)}
          </p>
          <p className="mt-3 text-dirty-ash">{excerpt(submission.body)}</p>
          {submission.source_url ? (
            <a className="mt-3 inline-block font-utility text-xs font-bold uppercase" href={submission.source_url}>
              Source Wire
            </a>
          ) : null}
          <form action={updatePostSubmission} className="mt-4 grid gap-3 border-t border-[rgba(183,178,168,0.24)] pt-4">
            <input name="id" type="hidden" value={submission.id} />
            <input name="name" type="hidden" value={submission.name} />
            <input name="email" type="hidden" value={submission.email} />
            <div className="grid gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_14rem_12rem]">
              <label className="grid gap-1">
                <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
                  Title
                </span>
                <input className={adminFieldBase} defaultValue={submission.title} name="title" />
              </label>
              <label className="grid gap-1">
                <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
                  Category
                </span>
                <select className={adminFieldBase} defaultValue={submission.category} name="category">
                  {postSubmissionCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
                  Status
                </span>
                <select className={adminFieldBase} defaultValue={submission.status} name="status">
                  {postSubmissionStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="grid gap-1">
              <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
                Body
              </span>
              <textarea className={adminFieldBase} defaultValue={submission.body} name="body" rows={6} />
            </label>
            <div className="grid gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <label className="grid gap-1">
                <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
                  Source URL
                </span>
                <input className={adminFieldBase} defaultValue={submission.source_url ?? ""} name="source_url" />
              </label>
              <label className="grid gap-1">
                <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
                  Admin Notes
                </span>
                <input className={adminFieldBase} defaultValue={submission.admin_notes ?? ""} name="admin_notes" />
              </label>
            </div>
            <div className="grid gap-3 border border-[rgba(214,184,74,0.3)] bg-dirty-black/35 p-3 min-[760px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <label className="grid gap-1">
                <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
                  Post Author
                </span>
                <input className={adminFieldBase} defaultValue={submission.name} name="author" />
              </label>
              <label className="grid gap-1">
                <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
                  Excerpt
                </span>
                <input className={adminFieldBase} defaultValue={excerpt(submission.body, 180)} name="excerpt" />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="button button-secondary" type="submit">
                Save Edit
              </button>
              <button className="button button-secondary" formAction={publishPostSubmission} name="intent" type="submit" value="draft">
                Approve as Draft
              </button>
              <button className="button button-primary" formAction={publishPostSubmission} name="intent" type="submit" value="publish">
                Publish File
              </button>
            </div>
          </form>
          <form action={deletePostSubmission} className="mt-3">
            <input name="id" type="hidden" value={submission.id} />
            <button className="danger-link" type="submit">
              Delete if Needed
            </button>
          </form>
        </article>
      ))}
    </div>
  );
}
