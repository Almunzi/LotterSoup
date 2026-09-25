import { IssueReader } from "../../../../components/issue-reader";
import { requireSubscriber } from "../../../../lib/auth/authorization";
import { getLatestIssue } from "../../../../lib/content/issues";

export const dynamic = "force-dynamic";
export const metadata = { title: "Latest Issue" };

export default async function LatestIssuePage() {
  await requireSubscriber();
  return <IssueReader issue={await getLatestIssue()} />;
}
