import "server-only";

import type { User } from "@supabase/supabase-js";
import { isBillingPlanId } from "../billing/plans";
import { getStripe } from "../billing/stripe";
import { syncCheckoutSession, syncSubscription } from "../billing/sync";
import { getSupabaseAdmin } from "../billing/supabase-admin";
import { safeSyncMailchimpSubscriberForUserId } from "../mailchimp/subscribers";
import { normalizeEmail } from "./validation";

function customerId(value: string | { id: string } | null) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function userHasEmail(user: User) {
  return Boolean(user.email);
}

export async function getCheckoutIdentity(sessionId: string) {
  if (!sessionId.startsWith("cs_")) return null;

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const stripeCustomerId = customerId(session.customer);
    const email = session.customer_details?.email;

    if (
      session.status !== "complete" ||
      session.mode !== "subscription" ||
      !stripeCustomerId ||
      !email ||
      !isBillingPlanId(session.metadata?.plan_id)
    ) {
      return null;
    }

    return {
      email: normalizeEmail(email),
      name: session.customer_details?.name?.trim() || null,
      customerId: stripeCustomerId,
      planId: session.metadata.plan_id,
    };
  } catch {
    return null;
  }
}

async function linkCustomer(customer: string, user: User) {
  const admin = getSupabaseAdmin();
  const { data: existing, error: readError } = await admin
    .from("stripe_customers")
    .select("user_id, email")
    .eq("stripe_customer_id", customer)
    .maybeSingle();

  if (readError) throw new Error(readError.message);
  if (!existing) throw new Error("Stripe customer has not been synchronized.");
  if (existing.user_id && existing.user_id !== user.id) {
    throw new Error("This subscription is already linked to another account.");
  }

  const { error } = await admin
    .from("stripe_customers")
    .update({ user_id: user.id, updated_at: new Date().toISOString() })
    .eq("stripe_customer_id", customer);

  if (error) throw new Error(error.message);
}

export async function linkCheckoutToUser(sessionId: string, user: User) {
  if (!sessionId.startsWith("cs_") || !userHasEmail(user)) {
    throw new Error("An account email and valid Checkout session are required.");
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const stripeCustomerId = customerId(session.customer);
  const subscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription?.id;
  const checkoutEmail = session.customer_details?.email;

  if (
    session.status !== "complete" ||
    session.mode !== "subscription" ||
    !stripeCustomerId ||
    !subscriptionId ||
    !checkoutEmail ||
    !isBillingPlanId(session.metadata?.plan_id) ||
    normalizeEmail(checkoutEmail) !== normalizeEmail(user.email || "")
  ) {
    throw new Error("The account email does not match this subscription.");
  }

  await syncCheckoutSession(session, "complete");
  await syncSubscription(await stripe.subscriptions.retrieve(subscriptionId));
  await linkCustomer(stripeCustomerId, user);
  await safeSyncMailchimpSubscriberForUserId(user.id);
}

export async function linkCustomersForUser(user: User) {
  if (!userHasEmail(user) || !user.email) return 0;

  const admin = getSupabaseAdmin();
  const { data: customers, error } = await admin
    .from("stripe_customers")
    .select("stripe_customer_id, user_id")
    .ilike("email", normalizeEmail(user.email));

  if (error) throw new Error(error.message);
  let linked = 0;

  for (const customer of customers || []) {
    if (customer.user_id && customer.user_id !== user.id) continue;

    const { data: activeSubscriptions, error: subscriptionError } = await admin
      .from("stripe_subscriptions")
      .select("stripe_subscription_id")
      .eq("stripe_customer_id", customer.stripe_customer_id)
      .eq("access_status", "active")
      .limit(1);

    if (subscriptionError) throw new Error(subscriptionError.message);
    if (!activeSubscriptions?.length) continue;
    await linkCustomer(customer.stripe_customer_id, user);
    linked += 1;
  }

  if (linked > 0) await safeSyncMailchimpSubscriberForUserId(user.id);

  return linked;
}
