import Link from "next/link";
import { ArrowRight, Check, Newspaper } from "../../components/icons";
import { InstallAppButton } from "../../components/install-app-button";
import { IssueCover } from "../../components/issue-cover";
import { requireSubscriber } from "../../lib/auth/authorization";
import { getLatestIssue } from "../../lib/content/issues";

export const dynamic = "force-dynamic";
export const metadata = { title: "Subscriber Home" };

export default async function SubscriberDashboard() {
  const { user, access } = await requireSubscriber();
  const latestIssue = await getLatestIssue();
  const firstName = user.name?.split(" ")[0] || "there";

  return <main className="subscriber-main">
    <section className="subscriber-hero">
      <div className="shell subscriber-hero-grid">
        <div>
          <p className="subscriber-eyebrow">Subscriber dashboard</p>
          <h1><span>Welcome, {firstName}.</span> Your latest serving is ready.</h1>
          <p>Open this week&apos;s LotterySoup update for Powerball and Mega Millions information, number trends, news, and the weekly AI number generator.</p>
          <div className="subscriber-hero-actions">
            <Link className="button button-yellow" href="/app/issues/latest">Read latest issue <ArrowRight /></Link>
            <Link className="plain-link" href="/app/archive">View issue archive</Link>
          </div>
        </div>
        <div className="dashboard-cover">
          <IssueCover issue={latestIssue} sizes="(max-width: 800px) 88vw, 420px" priority />
        </div>
      </div>
    </section>
    <section className="shell dashboard-section">
      <div className="dashboard-heading">
        <div><p className="section-label">This week</p><h2>Latest LotterySoup issue</h2></div>
        <span className="access-pill"><Check /> {access.status === "active" ? "Subscriber access active" : "Access active"}</span>
      </div>
      <div className="latest-issue-card">
        <div className="latest-issue-art"><IssueCover issue={latestIssue} sizes="(max-width: 700px) 100vw, 380px" /></div>
        <div className="latest-issue-copy">
          <Newspaper />
          <p className="section-label">Current edition</p>
          <h3>{latestIssue.title}</h3>
          <p>{latestIssue.excerpt}</p>
          <Link className="button" href="/app/issues/latest">Open the issue <ArrowRight /></Link>
        </div>
      </div>
      <div className="install-card">
        <div><p className="section-label">Keep it handy</p><h2>Install LotterySoup on your device.</h2><p>Add the subscriber app to your phone or desktop for quick access—no app store required.</p></div>
        <InstallAppButton />
      </div>
    </section>
  </main>;
}
