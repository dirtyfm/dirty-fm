import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { SignalControlLogin } from "@/components/admin/SignalControlLogin";
import { SignalControlLogout } from "@/components/admin/SignalControlLogout";
import { SectionStamp, StaticPanel, TickerBar } from "@/components/dirty";
import { AdminAuthorizationError } from "@/lib/authGuards";
import { DIRTYFM_ACCESS_TOKEN_COOKIE } from "@/lib/authSession";
import { requireAdmin } from "@/lib/db/admin";
import {
  getAdminDashboardData,
  type AdminDashboardComment,
  type AdminDashboardContact,
  type AdminDashboardPost,
  type AdminDashboardPostSubmission
} from "@/lib/db/adminDashboard";
import { postSubmissionCategories } from "@/lib/contentValidation";
import {
  contactSubmissionStatuses,
  postSubmissionStatuses
} from "@/lib/submissionWorkflows";
import {
  deleteContactSubmission,
  deletePostSubmission,
  publishPostSubmission,
  updateContactSubmission,
  updatePostSubmission
} from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Signal Control",
  description: "Protected DirtyFM admin dashboard for submissions, posts, and comments."
};

function formatDate(value: string | null) {
  if (!value) {
    return "Not aired";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function excerpt(value: string, maxLength = 180) {
  return value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value;
}

const adminFieldBase =
  "w-full border border-[rgba(183,178,168,0.28)] bg-dirty-black/70 px-3 py-2 text-sm text-dirty-ash outline-none focus:border-dirty-yellow";

function EmptyWire({ label }: { label: string }) {
  return (
    <div className="border border-dashed border-[rgba(183,178,168,0.28)] bg-dirty-black/45 p-4 font-utility text-xs font-bold uppercase text-dirty-gray">
      No {label} in the stack right now.
    </div>
  );
}

function LoginPanel({ message }: { message?: string }) {
  return (
    <div className="grid gap-8">
      <TickerBar
        items={[
          "SIGNAL CONTROL: protected admin wire",
          "PUBLIC USERS: no dashboard data",
          "CLEARANCE: Supabase session plus admin profile",
          "STATUS: locked until verified"
        ]}
        label="Signal Control"
      />
      <section className="grid gap-6 border border-[rgba(183,178,168,0.24)] bg-dirty-black/55 p-5 shadow-signal min-[860px]:grid-cols-[minmax(0,1fr)_24rem] min-[860px]:items-end min-[860px]:p-8">
        <div className="grid gap-4">
          <p className="eyebrow">Protected Console / No Public Wire</p>
          <h1 className="max-w-[10ch] font-display text-[clamp(3.2rem,12vw,7.5rem)] font-black uppercase leading-[0.9] text-dirty-ash">
            Signal Control
          </h1>
          <p className="max-w-2xl text-lg leading-snug text-dirty-gray min-[760px]:text-2xl">
            Operator room for incoming messages, Dirty News submissions, live
            files, and open mic comments. No clearance, no archive guts.
          </p>
          {message ? (
            <p className="max-w-2xl border-l-8 border-dirty-red bg-dirty-red/15 p-4 font-utility text-xs font-bold uppercase text-dirty-yellow">
              {message}
            </p>
          ) : null}
        </div>
        <SignalControlLogin />
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="border border-[rgba(183,178,168,0.24)] bg-dirty-coal/80 p-5">
      <p className="font-utility text-xs font-black uppercase text-dirty-yellow">{label}</p>
      <p className="mt-3 font-display text-5xl font-black uppercase leading-none text-dirty-red">
        {value}
      </p>
    </article>
  );
}

function ContactList({ contacts }: { contacts: AdminDashboardContact[] }) {
  if (contacts.length === 0) {
    return <EmptyWire label="incoming signals" />;
  }

  return (
    <div className="grid gap-3">
      {contacts.map((contact) => (
        <article className="archive-card" key={contact.id}>
          <div className="flex flex-col gap-2 min-[760px]:flex-row min-[760px]:items-start min-[760px]:justify-between">
            <div>
              <p className="card-label">{contact.submission_type}</p>
              <h3 className="mt-2 font-display text-3xl font-black uppercase leading-none text-dirty-ash">
                {contact.subject}
              </h3>
            </div>
            <p className="font-utility text-xs font-bold uppercase text-dirty-yellow">
              {formatDate(contact.created_at)}
            </p>
          </div>
          <p className="mt-3 text-sm text-dirty-gray">
            {contact.name} / {contact.email} / Read on air:{" "}
            {contact.can_read_on_air ? "yes" : "no"}
          </p>
          <p className="mt-3 text-dirty-ash">{excerpt(contact.message)}</p>
          <form action={updateContactSubmission} className="mt-4 grid gap-3 border-t border-[rgba(183,178,168,0.24)] pt-4">
            <input name="id" type="hidden" value={contact.id} />
            <div className="grid gap-3 min-[760px]:grid-cols-[12rem_minmax(0,1fr)_auto] min-[760px]:items-end">
              <label className="grid gap-1">
                <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
                  Status
                </span>
                <select className={adminFieldBase} defaultValue={contact.status} name="status">
                  {contactSubmissionStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
                  Admin Notes
                </span>
                <textarea
                  className={adminFieldBase}
                  defaultValue={contact.admin_notes ?? ""}
                  name="admin_notes"
                  rows={2}
                />
              </label>
              <button className="button button-secondary" type="submit">
                Save Signal
              </button>
            </div>
          </form>
          <form action={deleteContactSubmission} className="mt-3">
            <input name="id" type="hidden" value={contact.id} />
            <button className="font-utility text-xs font-black uppercase text-dirty-red" type="submit">
              Delete if Needed
            </button>
          </form>
        </article>
      ))}
    </div>
  );
}

function SubmissionList({ submissions }: { submissions: AdminDashboardPostSubmission[] }) {
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
            <div className="flex flex-wrap gap-2">
              <button className="button button-secondary" type="submit">
                Save Edit
              </button>
            </div>
          </form>
          <form action={publishPostSubmission} className="mt-3 grid gap-3 border border-[rgba(214,184,74,0.3)] bg-dirty-black/35 p-3">
            <input name="id" type="hidden" value={submission.id} />
            <input name="name" type="hidden" value={submission.name} />
            <input name="email" type="hidden" value={submission.email} />
            <input name="title" type="hidden" value={submission.title} />
            <input name="category" type="hidden" value={submission.category} />
            <input name="body" type="hidden" value={submission.body} />
            <input name="source_url" type="hidden" value={submission.source_url ?? ""} />
            <input name="admin_notes" type="hidden" value={submission.admin_notes ?? ""} />
            <div className="grid gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <label className="grid gap-1">
                <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
                  Post Author
                </span>
                <input className={adminFieldBase} defaultValue="DirtyFM Desk" name="author" />
              </label>
              <label className="grid gap-1">
                <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
                  Excerpt
                </span>
                <input className={adminFieldBase} defaultValue={excerpt(submission.body, 180)} name="excerpt" />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="button button-secondary" name="intent" type="submit" value="draft">
                Approve as Draft
              </button>
              <button className="button button-primary" name="intent" type="submit" value="publish">
                Publish File
              </button>
            </div>
          </form>
          <form action={deletePostSubmission} className="mt-3">
            <input name="id" type="hidden" value={submission.id} />
            <button className="font-utility text-xs font-black uppercase text-dirty-red" type="submit">
              Delete if Needed
            </button>
          </form>
        </article>
      ))}
    </div>
  );
}

function PostList({ posts }: { posts: AdminDashboardPost[] }) {
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

function CommentList({ comments }: { comments: AdminDashboardComment[] }) {
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
        </article>
      ))}
    </div>
  );
}

export default async function SignalControlPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(DIRTYFM_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return <LoginPanel />;
  }

  let verified:
    | {
        dashboard: Awaited<ReturnType<typeof getAdminDashboardData>>;
        profile: Awaited<ReturnType<typeof requireAdmin>>;
      }
    | null = null;
  let blockedMessage: string | null = null;

  try {
    const [profile, dashboard] = await Promise.all([
      requireAdmin(accessToken),
      getAdminDashboardData(accessToken)
    ]);

    verified = { dashboard, profile };
  } catch (error) {
    blockedMessage =
      error instanceof AdminAuthorizationError
        ? "Logged in, but this account has no Signal Control clearance."
        : "Signal Control could not verify this session. Log in again.";
  }

  if (!verified) {
    return (
      <StaticPanel label="Access Blocked" title="No Clearance. No Console." tone="red">
        <div className="grid gap-5">
          <p className="max-w-2xl text-lg leading-snug">{blockedMessage}</p>
          <SignalControlLogin />
        </div>
      </StaticPanel>
    );
  }

  const { dashboard, profile } = verified;

  return (
    <div className="grid gap-9 min-[760px]:gap-12">
      <TickerBar
        items={[
          "SIGNAL CONTROL: admin session verified",
          "MUTATIONS: intentionally limited this pass",
          "PUBLIC WIRE: still cannot publish directly",
          `CLEARANCE: ${profile.role}`
        ]}
        label="Signal Control"
      />

      <section className="grid gap-6 border border-[rgba(183,178,168,0.24)] bg-dirty-black/55 p-5 shadow-signal min-[860px]:grid-cols-[minmax(0,1fr)_auto] min-[860px]:items-end min-[860px]:p-8">
        <div className="grid gap-4">
          <p className="eyebrow">Overview / Operator Console</p>
          <h1 className="max-w-[11ch] font-display text-[clamp(3.2rem,12vw,7.5rem)] font-black uppercase leading-[0.9] text-dirty-ash">
            Signal Control
          </h1>
          <p className="max-w-3xl text-lg leading-snug text-dirty-gray min-[760px]:text-2xl">
            The locked room for incoming signals, pending Dirty News, live
            files, and the open mic comment pile. Readable first. Chaos after
            the door is secured.
          </p>
        </div>
        <SignalControlLogout />
      </section>

      <section className="grid gap-4" id="overview">
        <SectionStamp label="Overview" kicker="Dashboard Counts" tone="yellow" />
        <div className="grid gap-4 min-[620px]:grid-cols-2 min-[980px]:grid-cols-4">
          <StatCard label="Incoming Signals" value={dashboard.counts.contactSubmissions} />
          <StatCard label="Pending Dirty News" value={dashboard.counts.pendingDirtyNews} />
          <StatCard label="Published Posts" value={dashboard.counts.publishedPosts} />
          <StatCard label="Recent Comments" value={dashboard.counts.recentComments} />
        </div>
      </section>

      <section className="grid gap-4" id="incoming-signals">
        <SectionStamp label="Incoming Signals" kicker="Contact Messages" tone="red" />
        <ContactList contacts={dashboard.contacts} />
      </section>

      <section className="grid gap-4" id="pending-dirty-news">
        <SectionStamp label="Pending Dirty News" kicker="Submission Queue" tone="green" />
        <SubmissionList submissions={dashboard.postSubmissions} />
      </section>

      <section className="grid gap-4" id="live-files">
        <SectionStamp label="Live Files" kicker="Posts" tone="yellow" />
        <PostList posts={dashboard.posts} />
      </section>

      <section className="grid gap-4" id="open-mic-comments">
        <SectionStamp label="Open Mic Comments" kicker="Recent Comments" tone="red" />
        <CommentList comments={dashboard.comments} />
      </section>
    </div>
  );
}
