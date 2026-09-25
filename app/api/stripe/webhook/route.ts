import type Stripe from "stripe";
import { after } from "next/server";
import { getStripe } from "../../../../lib/billing/stripe";
import {
  markWebhookProcessed,
  syncCheckoutSession,
  syncStripeCustomer,
  syncInvoice,
  syncSubscription,
  webhookWasProcessed,
} from "../../../../lib/billing/sync";
import { safeSyncMailchimpSubscriberForStripeCustomer } from "../../../../lib/mailchimp/subscribers";

export const runtime = "nodejs";

function queueMailchimpSync(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  const customerId = typeof customer === "string" ? customer : customer?.id;
  if (customerId) after(() => safeSyncMailchimpSubscriberForStripeCustomer(customerId));
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret || !signature) {
    return Response.json({ error: "Webhook is not configured." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await request.text();
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return Response.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    if (await webhookWasProcessed(event.id)) {
      return Response.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case "checkout.session.completed":
        await syncCheckoutSession(event.data.object as Stripe.Checkout.Session, "complete");
        break;
      case "checkout.session.expired":
        await syncCheckoutSession(event.data.object as Stripe.Checkout.Session, "expired");
        break;
      case "customer.updated": {
        const customer = event.data.object as Stripe.Customer;
        await syncStripeCustomer(customer.id, customer.email, customer.name);
        queueMailchimpSync(customer.id);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
      case "customer.subscription.trial_will_end": {
        // Retrieve the latest object because Stripe doesn't guarantee event order.
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(await getStripe().subscriptions.retrieve(subscription.id));
        queueMailchimpSync(subscription.customer);
        break;
      }
      case "invoice.paid":
        await syncInvoice(event.data.object as Stripe.Invoice, "paid");
        queueMailchimpSync((event.data.object as Stripe.Invoice).customer);
        break;
      case "invoice.payment_failed":
      case "invoice.payment_action_required":
      case "invoice.marked_uncollectible":
        await syncInvoice(event.data.object as Stripe.Invoice, "failed");
        queueMailchimpSync((event.data.object as Stripe.Invoice).customer);
        break;
      default:
        break;
    }

    await markWebhookProcessed(event);
    return Response.json({ received: true });
  } catch (error) {
    console.error(`Stripe webhook processing failed for ${event.id}`, error);
    return Response.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
