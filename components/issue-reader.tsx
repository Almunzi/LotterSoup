import Image from "next/image";
import Link from "next/link";
import type { NewsletterIssue } from "../lib/content/issues";
import { formatIssueDate } from "../lib/content/issues";
import { Archive } from "./icons";

export function IssueReader({ issue }: { issue: NewsletterIssue }) {
  return <main className="subscriber-main issue-page">
    <section className="issue-title shell">
      <div><p className="subscriber-eyebrow">{formatIssueDate(issue.publishedAt)}</p><h1>{issue.title}</h1><p>{issue.excerpt}</p></div>
      <Link className="button button-outline" href="/app/archive"><Archive /> View archive</Link>
    </section>
    <section className="shell issue-reader" aria-label={issue.title}>
      {issue.contentHtml
        ? <article className="mailchimp-issue" dangerouslySetInnerHTML={{ __html: issue.contentHtml }} />
        : issue.imagePath
          ? <Image src={`/api/issues/${encodeURIComponent(issue.slug)}/image`} width={issue.imageWidth} height={issue.imageHeight} priority unoptimized alt={`${issue.title} LotterySoup newsletter`} />
          : <p className="issue-unavailable">This issue is not available yet.</p>}
    </section>
    <div className="shell issue-disclaimer">LotterySoup provides informational and entertainment content only. Always verify drawing information with official lottery sources and play responsibly.</div>
  </main>;
}
