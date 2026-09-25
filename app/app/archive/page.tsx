import Link from "next/link";
import { ArrowRight, Archive } from "../../../components/icons";
import { IssueCover } from "../../../components/issue-cover";
import { requireSubscriber } from "../../../lib/auth/authorization";
import { formatIssueDate, getPublishedIssues } from "../../../lib/content/issues";

export const dynamic = "force-dynamic";
export const metadata = { title: "Issue Archive" };

export default async function ArchivePage() {
  await requireSubscriber();
  const issues = await getPublishedIssues();

  return <main className="subscriber-main archive-page">
    <section className="archive-hero">
      <div className="shell"><p className="subscriber-eyebrow">Subscriber library</p><h1>LotterySoup issue archive</h1><p>Past subscriber issues will remain organized here as new editions are published.</p></div>
    </section>
    <section className="shell archive-content">
      <div className="archive-list-heading"><h2>Available issues</h2><span>{issues.length} {issues.length === 1 ? "issue" : "issues"}</span></div>
      <div className="archive-list">
        {issues.map((issue, index) => <article className="archive-item" key={issue.slug}>
          <div className="archive-thumb"><IssueCover issue={issue} sizes="180px" /></div>
          <div>{index === 0 && <span className="archive-current">Latest issue</span>}<small>{formatIssueDate(issue.publishedAt)}</small><h3>{issue.title}</h3><p>{issue.excerpt}</p><Link href={index === 0 ? "/app/issues/latest" : `/app/issues/${issue.slug}`}>Read issue <ArrowRight /></Link></div>
        </article>)}
      </div>
      {issues.length === 1 && <div className="archive-empty"><Archive /><div><strong>More editions will appear here.</strong><p>Sent Mailchimp newsletters will be added automatically after the archive sync is enabled.</p></div></div>}
    </section>
  </main>;
}
