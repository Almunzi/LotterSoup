import { isMailchimpConfigured } from "../../../../lib/mailchimp/config";
import { syncMailchimpCampaignArchive } from "../../../../lib/mailchimp/archive";
import { syncAllLinkedMailchimpSubscribers } from "../../../../lib/mailchimp/subscribers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

async function runSync(request: Request) {
  if (!isAuthorized(request)) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isMailchimpConfigured()) return Response.json({ error: "Mailchimp is not configured." }, { status: 503 });

  try {
    const [subscribers, archive] = await Promise.all([
      syncAllLinkedMailchimpSubscribers(),
      syncMailchimpCampaignArchive(),
    ]);
    return Response.json({ ok: true, subscribers, archive, syncedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Mailchimp scheduled synchronization failed", error);
    return Response.json({ error: "Mailchimp synchronization failed." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return runSync(request);
}

export async function POST(request: Request) {
  return runSync(request);
}
