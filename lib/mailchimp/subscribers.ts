import "server-only";

import { getSubscriptionAccountForUser } from "../billing/access";
import { getSupabaseAdmin } from "../billing/supabase-admin";
import { mailchimpRequest, mailchimpSubscriberHash } from "./client";
import { getMailchimpConfig, isMailchimpConfigured } from "./config";

type MailchimpMember = {
  email_address: string;
  id: string;
  status: string;
};

export type MailchimpSyncResult = {
  userId: string;
  outcome: "synced" | "skipped" | "failed";
  reason?: string;
};

function nameParts(fullName: string | null) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") };
}

function messageFromError(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 1000) : "Unknown Mailchimp synchronization error.";
}

async function recordSync(values: Record<string, unknown>) {
  const { error } = await getSupabaseAdmin()
    .from("mailchimp_member_syncs")
    .upsert(values, { onConflict: "user_id" });

  if (error) throw new Error(error.message);
}

export async function syncMailchimpSubscriberForUserId(userId: string): Promise<MailchimpSyncResult> {
  if (!isMailchimpConfigured()) return { userId, outcome: "skipped", reason: "Mailchimp is not configured." };

  let email: string | null = null;

  try {
    const admin = getSupabaseAdmin();
    const [{ data: userData, error: userError }, account] = await Promise.all([
      admin.auth.admin.getUserById(userId),
      getSubscriptionAccountForUser(userId),
    ]);

    if (userError) throw new Error(userError.message);
    email = userData.user?.email?.trim().toLowerCase() || null;
    if (!email) throw new Error("The subscriber account does not have an email address.");

    const fullName = typeof userData.user?.user_metadata?.full_name === "string"
      ? userData.user.user_metadata.full_name.trim()
      : null;
    const { firstName, lastName } = nameParts(fullName);
    const memberHash = mailchimpSubscriberHash(email);
    const config = getMailchimpConfig();
    const member = await mailchimpRequest<MailchimpMember>(
      `/lists/${encodeURIComponent(config.audienceId)}/members/${memberHash}`,
      {
        method: "PUT",
        body: JSON.stringify({
          email_address: email,
          status_if_new: config.newMemberStatus,
          ...(firstName || lastName ? { merge_fields: { FNAME: firstName, LNAME: lastName } } : {}),
        }),
      },
    );

    const status = account.cancelAtPeriodEnd ? "cancelled" : account.status;
    const tags = [
      { name: "LotterySoup Customer", status: "active" },
      { name: "LotterySoup Access Active", status: account.allowed ? "active" : "inactive" },
      { name: "LotterySoup Weekly", status: account.planId === "weekly" ? "active" : "inactive" },
      { name: "LotterySoup Monthly", status: account.planId === "monthly" ? "active" : "inactive" },
      { name: "LotterySoup Annual", status: account.planId === "annual" ? "active" : "inactive" },
      { name: "LotterySoup Status Active", status: account.allowed && !account.cancelAtPeriodEnd ? "active" : "inactive" },
      { name: "LotterySoup Status Cancelled", status: status === "cancelled" ? "active" : "inactive" },
      { name: "LotterySoup Status Expired", status: status === "expired" ? "active" : "inactive" },
      { name: "LotterySoup Payment Failed", status: status === "failed" ? "active" : "inactive" },
    ];

    await mailchimpRequest(
      `/lists/${encodeURIComponent(config.audienceId)}/members/${memberHash}/tags`,
      { method: "POST", body: JSON.stringify({ tags }) },
    );

    await recordSync({
      user_id: userId,
      email,
      member_hash: member.id || memberHash,
      mailchimp_status: member.status,
      access_status: status,
      plan_id: account.planId,
      last_synced_at: new Date().toISOString(),
      last_error: null,
      updated_at: new Date().toISOString(),
    });

    return { userId, outcome: "synced" };
  } catch (error) {
    const reason = messageFromError(error);
    try {
      await recordSync({
        user_id: userId,
        email,
        last_error: reason,
        updated_at: new Date().toISOString(),
      });
    } catch (recordError) {
      console.error(`Unable to record Mailchimp failure for user ${userId}`, recordError);
    }
    return { userId, outcome: "failed", reason };
  }
}

export async function syncMailchimpSubscriberForStripeCustomer(stripeCustomerId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("stripe_customers")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.user_id) return { userId: "", outcome: "skipped", reason: "Stripe customer is not linked." } as MailchimpSyncResult;
  return syncMailchimpSubscriberForUserId(data.user_id);
}

export async function safeSyncMailchimpSubscriberForUserId(userId: string) {
  const result = await syncMailchimpSubscriberForUserId(userId);
  if (result.outcome === "failed") console.error(`Mailchimp subscriber sync failed for user ${userId}.`);
  return result;
}

export async function safeSyncMailchimpSubscriberForStripeCustomer(stripeCustomerId: string) {
  try {
    const result = await syncMailchimpSubscriberForStripeCustomer(stripeCustomerId);
    if (result.outcome === "failed") console.error(`Mailchimp subscriber sync failed for Stripe customer ${stripeCustomerId}.`);
    return result;
  } catch (error) {
    console.error(`Unable to start Mailchimp sync for Stripe customer ${stripeCustomerId}`, error);
    return { userId: "", outcome: "failed", reason: messageFromError(error) } as MailchimpSyncResult;
  }
}

export async function syncAllLinkedMailchimpSubscribers() {
  const { data, error } = await getSupabaseAdmin()
    .from("stripe_customers")
    .select("user_id")
    .not("user_id", "is", null);

  if (error) throw new Error(error.message);
  const userIds = [...new Set((data || []).map((row) => row.user_id).filter((value): value is string => Boolean(value)))];
  const results: MailchimpSyncResult[] = [];

  for (let index = 0; index < userIds.length; index += 5) {
    results.push(...await Promise.all(userIds.slice(index, index + 5).map(syncMailchimpSubscriberForUserId)));
  }

  return {
    total: results.length,
    synced: results.filter((result) => result.outcome === "synced").length,
    skipped: results.filter((result) => result.outcome === "skipped").length,
    failed: results.filter((result) => result.outcome === "failed").length,
  };
}
