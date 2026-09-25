import { notFound } from "next/navigation";
import { IssueReader } from "../../../../components/issue-reader";
import { requireSubscriber } from "../../../../lib/auth/authorization";
import { getPublishedIssue } from "../../../../lib/content/issues";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export default async function ArchivedIssuePage({ params }: PageProps) {
  await requireSubscriber();
  const issue = await getPublishedIssue((await params).slug);
  if (!issue) notFound();
  return <IssueReader issue={issue} />;
}
