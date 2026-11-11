import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SignalControlLogin } from "@/components/admin/SignalControlLogin";
import { SignalControlLogout } from "@/components/admin/SignalControlLogout";
import {
  CommentList,
  ContactList,
  HomeSettingsPanel,
  PostEditorList,
  PostList,
  SignalControlLoginPanel,
  SignalControlStats,
  SubmissionList,
  VideoEditorList
} from "@/components/admin/signal-control";
import { SectionStamp, StaticPanel, TickerBar } from "@/components/dirty";
import { AdminAuthorizationError } from "@/lib/authGuards";
import { DIRTYFM_ACCESS_TOKEN_COOKIE } from "@/lib/authSession";
import { isKvContentBackend } from "@/lib/contentBackend";
import { requireAdmin } from "@/lib/db/admin";
import { getAdminDashboardData } from "@/lib/db/adminDashboard";
import { getKvAdminVideos, getKvHomeSettings } from "@/lib/kv/contentStore";
import { SignalControlForms } from "@/components/admin/signal-control/SignalControlForms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Signal Control",
  description: "Protected DirtyFM admin dashboard for submissions, posts, and comments.",
  robots: { index: false, follow: false }
};

export default async function SignalControlPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(DIRTYFM_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return <SignalControlLoginPanel />;
  }

  let profile: Awaited<ReturnType<typeof requireAdmin>> | null = null;
  let blockedMessage: string | null = null;

  try {
    profile = await requireAdmin(accessToken);
  } catch (error) {
    blockedMessage =
      error instanceof AdminAuthorizationError
        ? "Logged in, but this account has no Signal Control clearance."
        : "Signal Control could not verify this session. Log in again.";
  }

  if (!profile) {
    return (
      <StaticPanel label="Access Blocked" title="No Clearance. No Console." tone="red">
        <div className="grid gap-5">
          <p className="max-w-2xl text-lg leading-snug">{blockedMessage}</p>
          <SignalControlLogin />
        </div>
      </StaticPanel>
    );
  }

  const kvEnabled = isKvContentBackend();
  const [dashboard, homeSettings, videos] = await Promise.all([
    getAdminDashboardData(accessToken),
    kvEnabled ? getKvHomeSettings() : null,
    kvEnabled ? getKvAdminVideos() : []
  ]);

  return (
    <div className="grid gap-9 min-[760px]:gap-12">
      <TickerBar
        items={[
          "SIGNAL CONTROL: admin session verified",
          "REVIEW: pending files go to Live Files or Review History",
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
        <a className="nav-link" href="#pending-dirty-news">Pending News ({dashboard.counts.pendingDirtyNews})</a>
        <a className="nav-link" href="#live-files">Posts</a>
        <a className="nav-link" href="#review-history">Review History</a>
        {kvEnabled ? <a className="nav-link" href="#video-trash">Videos</a> : null}
        <a className="nav-link" href="#open-mic-comments">Comments</a>
      </nav>

      <SignalControlForms>
      <section className="grid gap-4" id="overview">
        <SectionStamp label="Overview" kicker="Dashboard Counts" tone="yellow" />
        <SignalControlStats counts={dashboard.counts} />
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

      <section className="grid scroll-mt-24 gap-4" id="pending-dirty-news">
        <SectionStamp label="Pending Dirty News" kicker="Submission Queue" tone="green" />
        <SubmissionList submissions={dashboard.postSubmissions} />
      </section>

      <section className="grid scroll-mt-24 gap-4" id="live-files">
        <SectionStamp label="Live Files" kicker="Posts" tone="yellow" />
        {kvEnabled ? <PostEditorList posts={dashboard.posts} /> : <PostList posts={dashboard.posts} />}
      </section>

      <section className="grid scroll-mt-24 gap-4" id="review-history">
        <SectionStamp label="Review History" kicker="Completed Dirty News Submissions" tone="green" />
        {dashboard.reviewedSubmissions.length > 0 ? (
          <details className="archive-card">
            <summary className="cursor-pointer font-display text-2xl uppercase text-dirty-ash">
              Reviewed submissions ({dashboard.reviewedSubmissions.length})
            </summary>
            <ul className="mt-3 grid divide-y divide-dirty-gray/25">
              {dashboard.reviewedSubmissions.map((submission) => (
                <li className="grid gap-2 py-3 min-[760px]:grid-cols-[1fr_auto]" key={submission.id}>
                  <div>
                    <p className="font-bold text-dirty-ash">{submission.title}</p>
                    <p className="mt-1 text-sm text-dirty-gray">{submission.category} · {submission.name}</p>
                    {submission.admin_notes ? <p className="mt-1 text-sm text-dirty-gray">{submission.admin_notes}</p> : null}
                  </div>
                  <div className="flex flex-wrap items-start gap-3 text-sm">
                    <span className="font-utility uppercase text-dirty-yellow">{submission.status}</span>
                    {submission.postId ? <a className="underline" href={`#post-${submission.postId}`}>Live Files</a> : null}
                    {submission.postSlug ? <a className="underline" href={`/dirty-news/${encodeURIComponent(submission.postSlug)}`}>Public post</a> : null}
                  </div>
                </li>
              ))}
            </ul>
          </details>
        ) : <p className="text-dirty-gray">No reviewed submissions yet.</p>}
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
      </SignalControlForms>
    </div>
  );
}
