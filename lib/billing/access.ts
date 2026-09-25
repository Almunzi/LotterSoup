import "server-only";

import { getSupabaseAdmin } from "./supabase-admin";

export type SubscriptionAccess = {
  allowed: boolean;
  status: "active" | "cancelled" | "expired" | "failed" | "none";
  planId: string | null;
  periodEnd: string | null;
};

export type SubscriptionAccount = SubscriptionAccess & {
  customerId: string | null;
  subscriptionId: string | null;
  stripeStatus: string | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  lastPaymentStatus: "paid" | "failed" | null;
};

export async function getSubscriptionAccessForUser(userId: string): Promise<SubscriptionAccess> {
  const account = await getSubscriptionAccountForUser(userId);
  return {
    allowed: account.allowed,
    status: account.status,
    planId: account.planId,
    periodEnd: account.periodEnd,
  };
}

export async function getSubscriptionAccountForUser(userId: string): Promise<SubscriptionAccount> {
  const supabase = getSupabaseAdmin();
  const { data: customers, error: customerError } = await supabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", userId);

  if (customerError) throw new Error(customerError.message);
  if (!customers?.length) return emptyAccount();

  const { data: subscriptions, error: subscriptionError } = await supabase
    .from("stripe_subscriptions")
    .select("stripe_subscription_id, stripe_customer_id, stripe_status, access_status, plan_id, current_period_end, trial_end, cancel_at_period_end, last_payment_status")
    .in("stripe_customer_id", customers.map((customer) => customer.stripe_customer_id))
    .order("current_period_end", { ascending: false })
    .limit(20);

  if (subscriptionError) throw new Error(subscriptionError.message);
  if (!subscriptions?.length) return emptyAccount(customers[0].stripe_customer_id);

  // A customer can hold more than one subscription. Any active/trialing record
  // must grant access even if a newer failed or cancelled record also exists.
  const subscription = subscriptions.find((item) => item.access_status === "active")
    || subscriptions[0];

  return {
    allowed: subscription.access_status === "active",
    status: subscription.access_status,
    planId: subscription.plan_id,
    periodEnd: subscription.current_period_end,
    customerId: subscription.stripe_customer_id,
    subscriptionId: subscription.stripe_subscription_id,
    stripeStatus: subscription.stripe_status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    trialEnd: subscription.trial_end,
    lastPaymentStatus: subscription.last_payment_status,
  };
}

function emptyAccount(customerId: string | null = null): SubscriptionAccount {
  return {
    allowed: false,
    status: "none",
    planId: null,
    periodEnd: null,
    customerId,
    subscriptionId: null,
    stripeStatus: null,
    cancelAtPeriodEnd: false,
    trialEnd: null,
    lastPaymentStatus: null,
  };
}
