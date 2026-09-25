import "server-only";

import type Stripe from "stripe";
import { getPlanIdForStripePrice } from "./plans";
import { getStripe } from "./stripe";
import { normalizeSubscriptionStatus } from "./subscription-status";
import { getSupabaseAdmin } from "./supabase-admin";

function objectId(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function isoDate(timestamp: number | null | undefined) {
  return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}

async function throwOnError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function isUuid(value: string | null | undefined) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

async function linkCustomerToUser(customerId: string, userId: string | null | undefined) {
  if (!isUuid(userId)) return;

  const { error } = await getSupabaseAdmin()
    .from("stripe_customers")
    .update({ user_id: userId, updated_at: new Date().toISOString() })
    .eq("stripe_customer_id", customerId)
    .or(`user_id.is.null,user_id.eq.${userId}`);

  await throwOnError(error);
}

export async function syncStripeCustomer(
  customerId: string,
  suppliedEmail?: string | null,
  suppliedName?: string | null,
) {
  const stripe = getStripe();
  let email = suppliedEmail?.trim().toLowerCase() || null;
  let name = suppliedName?.trim() || null;

  if (!email || !name) {
    const customer = await stripe.customers.retrieve(customerId);
    if (!("deleted" in customer && customer.deleted)) {
      email ||= customer.email?.trim().toLowerCase() || null;
      name ||= customer.name?.trim() || null;
    }
  }

  const { error } = await getSupabaseAdmin()
    .from("stripe_customers")
    .upsert({
      stripe_customer_id: customerId,
      email,
      name,
      updated_at: new Date().toISOString(),
    }, { onConflict: "stripe_customer_id" });

  await throwOnError(error);
}

export async function syncCheckoutSession(
  session: Stripe.Checkout.Session,
  checkoutStatus: "complete" | "expired",
) {
  const customerId = objectId(session.customer);
  const subscriptionId = objectId(session.subscription);

  if (customerId) {
    await syncStripeCustomer(
      customerId,
      session.customer_details?.email,
      session.customer_details?.name,
    );
    await linkCustomerToUser(customerId, session.client_reference_id);
  }

  const { error } = await getSupabaseAdmin()
    .from("stripe_checkout_sessions")
    .upsert({
      stripe_checkout_session_id: session.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      customer_email: session.customer_details?.email?.trim().toLowerCase() || null,
      plan_id: session.metadata?.plan_id || null,
      status: checkoutStatus,
      payment_status: session.payment_status,
      updated_at: new Date().toISOString(),
    }, { onConflict: "stripe_checkout_session_id" });

  await throwOnError(error);
}

export async function syncSubscription(subscription: Stripe.Subscription) {
  const customerId = objectId(subscription.customer);
  if (!customerId) throw new Error("Stripe subscription has no customer.");

  await syncStripeCustomer(customerId);
  await linkCustomerToUser(customerId, subscription.metadata.user_id);

  const item = subscription.items.data[0];
  const priceId = item?.price.id || null;
  const { error } = await getSupabaseAdmin()
    .from("stripe_subscriptions")
    .upsert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      stripe_price_id: priceId,
      plan_id: subscription.metadata.plan_id || getPlanIdForStripePrice(priceId),
      stripe_status: subscription.status,
      access_status: normalizeSubscriptionStatus(subscription.status),
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_start: isoDate(item?.current_period_start),
      current_period_end: isoDate(item?.current_period_end),
      trial_start: isoDate(subscription.trial_start),
      trial_end: isoDate(subscription.trial_end),
      canceled_at: isoDate(subscription.canceled_at),
      ended_at: isoDate(subscription.ended_at),
      latest_invoice_id: objectId(subscription.latest_invoice),
      livemode: subscription.livemode,
      updated_at: new Date().toISOString(),
    }, { onConflict: "stripe_subscription_id" });

  await throwOnError(error);
}

export async function syncInvoice(invoice: Stripe.Invoice, paymentStatus: "paid" | "failed") {
  const customerId = objectId(invoice.customer);
  const subscriptionId = objectId(invoice.parent?.subscription_details?.subscription);

  if (customerId) {
    await syncStripeCustomer(customerId, invoice.customer_email, invoice.customer_name);
  }

  // Stripe doesn't guarantee webhook delivery order. Ensure the parent subscription
  // exists before inserting an invoice that references it.
  if (subscriptionId) {
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
    await syncSubscription(subscription);
  }

  const { error: invoiceError } = await getSupabaseAdmin()
    .from("stripe_invoices")
    .upsert({
      stripe_invoice_id: invoice.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stripe_status: invoice.status,
      payment_status: paymentStatus,
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      currency: invoice.currency,
      hosted_invoice_url: invoice.hosted_invoice_url || null,
      invoice_pdf: invoice.invoice_pdf || null,
      period_start: isoDate(invoice.period_start),
      period_end: isoDate(invoice.period_end),
      updated_at: new Date().toISOString(),
    }, { onConflict: "stripe_invoice_id" });

  await throwOnError(invoiceError);

  if (subscriptionId) {
    const { error: subscriptionError } = await getSupabaseAdmin()
      .from("stripe_subscriptions")
      .update({
        latest_invoice_id: invoice.id,
        last_payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscriptionId);

    await throwOnError(subscriptionError);
  }
}

export async function webhookWasProcessed(eventId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("stripe_webhook_events")
    .select("stripe_event_id")
    .eq("stripe_event_id", eventId)
    .maybeSingle();

  await throwOnError(error);
  return Boolean(data);
}

export async function markWebhookProcessed(event: Stripe.Event) {
  const { error } = await getSupabaseAdmin()
    .from("stripe_webhook_events")
    .upsert({
      stripe_event_id: event.id,
      event_type: event.type,
      livemode: event.livemode,
      processed_at: new Date().toISOString(),
    }, { onConflict: "stripe_event_id" });

  await throwOnError(error);
}
