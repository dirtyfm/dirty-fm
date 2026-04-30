import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { SignalControlLogin } from "@/components/admin/SignalControlLogin";
import { SignalControlLogout } from "@/components/admin/SignalControlLogout";
import { SectionStamp, StaticPanel, TickerBar } from "@/components/dirty";
import { AdminAuthorizationError } from "@/lib/authGuards";
import { DIRTYFM_ACCESS_TOKEN_COOKIE } from "@/lib/authSession";
import { isKvContentBackend } from "@/lib/contentBackend";
import { requireAdmin } from "@/lib/db/admin";
import {
  getAdminDashboardData,
  type AdminDashboardComment,
  type AdminDashboardContact,
  type AdminDashboardPost,
  type AdminDashboardPostSubmission
} from "@/lib/db/adminDashboard";
import { getKvAdminVideos, getKvHomeSettings } from "@/lib/kv/contentStore";
import { postSubmissionCategories } from "@/lib/contentValidation";
import {
  contactSubmissionStatuses,
  postSubmissionStatuses
} from "@/lib/submissionWorkflows";
import {
  deleteComment,
  deleteContactSubmission,
  deletePost,
  deletePostSubmission,
  deleteVideo,
  hideComment,
  publishPostSubmission,
  restoreComment,
  savePost,
  saveVideo,
  updateHomeSettings,
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
    <div className="border border-dashed border-[rgba(183,178,168,0.28)] bg-dirty-black/45 p-4">
      <p className="font-display text-2xl font-black uppercase leading-none text-dirty-ash">
        Stack Clear.
      </p>
      <p className="mt-2 font-utility text-xs font-bold uppercase text-dirty-gray">
        No {label} in the stack right now.
      </p>
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
          "CLEARANCE: local operator session or Supabase admin profile",
          "STATUS: locked until verified"
        ]}
        label="Signal Control"
      />
      <section className="broadcast-panel p-5 min-[860px]:p-8">
        <div className="relative grid gap-6 min-[860px]:grid-cols-[minmax(0,1fr)_24rem] min-[860px]:items-end">
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
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="border border-[rgba(183,178,168,0.24)] border-l-4 border-l-dirty-yellow bg-dirty-coal/80 p-5">
      <p className="font-utility text-xs font-black uppercase text-dirty-yellow">{label}</p>
      <p className="mt-3 font-display text-5xl font-black uppercase leading-none text-dirty-red">
        {value}
      </p>
    </article>
  );
}

function HomeSettingsPanel({
  settings
}: {
  settings: Awaited<ReturnType<typeof getKvHomeSettings>>;
}) {
  return (
    <form action={updateHomeSettings} className="archive-card grid gap-3">
      <div className="grid gap-3 min-[760px]:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
        <label className="grid gap-1">
          <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
            Hero Eyebrow
          </span>
          <input className={adminFieldBase} defaultValue={settings.hero_eyebrow} name="hero_eyebrow" />
        </label>
        <label className="grid gap-1">
          <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
            Side Callout
          </span>
          <input className={adminFieldBase} defaultValue={settings.hero_aside} name="hero_aside" />
        </label>
      </div>
      <label className="grid gap-1">
        <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
          Hero Title
        </span>
        <textarea className={adminFieldBase} defaultValue={settings.hero_title} name="hero_title" rows={2} />
      </label>
      <label className="grid gap-1">
        <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
          Hero Body
        </span>
        <textarea className={adminFieldBase} defaultValue={settings.hero_body} name="hero_body" rows={3} />
      </label>
      <button className="button button-primary justify-self-start" type="submit">
        Save Front Signal
      </button>
    </form>
  );
}

function PostEditorList({ posts }: { posts: AdminDashboardPost[] }) {
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

function VideoEditorList({
  videos
}: {
  videos: Awaited<ReturnType<typeof getKvAdminVideos>>;
}) {
  const statuses = ["featured", "unapproved", "raw clip", "archive file"];

  return (
    <div className="grid gap-4">
      {[null, ...videos].map((video, index) => (
        <article className="archive-card" key={video?.id ?? "new-video"}>
          <form action={saveVideo} className="grid gap-3">
            {video ? <input name="id" type="hidden" value={video.id} /> : null}
            <p className="card-label">{video ? "Edit Video File" : "Create Video File"}</p>
            <div className="grid gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_12rem_11rem]">
              <input className={adminFieldBase} defaultValue={video?.title ?? ""} name="title" placeholder="Title" />
              <input className={adminFieldBase} defaultValue={video?.youtube_id ?? ""} name="youtube_id" placeholder="YouTube ID" />
              <select className={adminFieldBase} defaultValue={video?.status ?? "archive file"} name="status">
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <textarea className={adminFieldBase} defaultValue={video?.description ?? ""} name="description" placeholder="Description" rows={3} />
            <div className="grid gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_11rem]">
              <input className={adminFieldBase} defaultValue={video?.category ?? "Video Trash"} name="category" placeholder="Category" />
              <input className={adminFieldBase} defaultValue={video?.host ?? "Drift"} name="host" placeholder="Host" />
              <input className={adminFieldBase} defaultValue={video?.published_at ?? new Date().toISOString()} name="published_at" />
            </div>
            <label className="flex items-center gap-2 font-utility text-xs font-black uppercase text-dirty-yellow">
              <input defaultChecked={video?.is_featured ?? index === 0} name="is_featured" type="checkbox" />
              Featured
            </label>
            <button className="button button-secondary justify-self-start" type="submit">
              {video ? "Save Video" : "File New Video"}
            </button>
          </form>
          {video ? (
            <form action={deleteVideo} className="mt-3">
              <input name="id" type="hidden" value={video.id} />
              <button className="danger-link" type="submit">Delete Video</button>
            </form>
          ) : null}
        </article>
      ))}
    </div>
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
            <button className="danger-link" type="submit">
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
            <div className="grid gap-3 border border-[rgba(214,184,74,0.3)] bg-dirty-black/35 p-3 min-[760px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
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
  const kvEnabled = isKvContentBackend();
  const homeSettings = kvEnabled ? await getKvHomeSettings() : null;
  const videos = kvEnabled ? await getKvAdminVideos() : [];

  return (
    <div className="grid gap-9 min-[760px]:gap-12">
      <TickerBar
        items={[
          "SIGNAL CONTROL: admin session verified",
          "MUTATIONS: KV-backed controls live",
          "PUBLIC WIRE: still cannot publish directly",
          `CLEARANCE: ${profile.role}`
        ]}
        label="Signal Control"
      />

      <section className="broadcast-panel p-5 min-[860px]:p-8">
        <div className="relative grid gap-6 min-[860px]:grid-cols-[minmax(0,1fr)_auto] min-[860px]:items-end">
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
        </div>
      </section>

      <nav
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 min-[760px]:mx-0 min-[760px]:flex-wrap min-[760px]:overflow-visible min-[760px]:px-0 min-[760px]:pb-0"
        aria-label="Signal Control sections"
      >
        <a className="nav-link" href="#overview">Overview</a>
        {kvEnabled ? <a className="nav-link" href="#front-signal">Front Signal</a> : null}
        <a className="nav-link" href="#incoming-signals">Signals</a>
        <a className="nav-link" href="#pending-dirty-news">Pending News</a>
        <a className="nav-link" href="#live-files">Posts</a>
        {kvEnabled ? <a className="nav-link" href="#video-trash">Videos</a> : null}
        <a className="nav-link" href="#open-mic-comments">Comments</a>
      </nav>

      <section className="grid gap-4" id="overview">
        <SectionStamp label="Overview" kicker="Dashboard Counts" tone="yellow" />
        <div className="grid gap-4 min-[620px]:grid-cols-2 min-[980px]:grid-cols-4">
          <StatCard label="Incoming Signals" value={dashboard.counts.contactSubmissions} />
          <StatCard label="Pending Dirty News" value={dashboard.counts.pendingDirtyNews} />
          <StatCard label="Published Posts" value={dashboard.counts.publishedPosts} />
          <StatCard label="Recent Comments" value={dashboard.counts.recentComments} />
        </div>
      </section>

      {homeSettings ? (
        <section className="grid gap-4" id="front-signal">
          <SectionStamp label="Front Signal" kicker="Homepage Copy" tone="red" />
          <HomeSettingsPanel settings={homeSettings} />
        </section>
      ) : null}

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
        {kvEnabled ? <PostEditorList posts={dashboard.posts} /> : <PostList posts={dashboard.posts} />}
      </section>

      {kvEnabled ? (
        <section className="grid gap-4" id="video-trash">
          <SectionStamp label="Video Trash" kicker="Dirty TV Files" tone="green" />
          <VideoEditorList videos={videos} />
        </section>
      ) : null}

      <section className="grid gap-4" id="open-mic-comments">
        <SectionStamp label="Open Mic Comments" kicker="Recent Comments" tone="red" />
        <CommentList comments={dashboard.comments} />
      </section>
    </div>
  );
}
