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

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Signal Control",
  description: "Protected DirtyFM admin dashboard for submissions, posts, and comments."
};

export default async function SignalControlPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(DIRTYFM_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return <SignalControlLoginPanel />;
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
