import type Stripe from "stripe";

export type AccessStatus = "active" | "cancelled" | "expired" | "failed";

export function normalizeSubscriptionStatus(status: Stripe.Subscription.Status): AccessStatus {
  if (status === "active" || status === "trialing") return "active";
  if (status === "canceled") return "cancelled";
  if (status === "incomplete_expired") return "expired";
  return "failed";
}

export function subscriptionAllowsAccess(status: Stripe.Subscription.Status) {
  return status === "active" || status === "trialing";
}
