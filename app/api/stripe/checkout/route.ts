import { type NextRequest, NextResponse } from "next/server";
import { getFreshAuthenticatedUser } from "../../../../lib/auth/session";
import { getSubscriptionAccountForUser } from "../../../../lib/billing/access";
import { getStripePriceId, isBillingPlanId } from "../../../../lib/billing/plans";
import { getSiteUrl, getStripe, isTrustedFormOrigin } from "../../../../lib/billing/stripe";

export const runtime = "nodejs";

function errorRedirect(request: Request, reason: string) {
  return NextResponse.redirect(new URL(`/subscription/error?reason=${reason}`, request.url), 303);
}

export async function POST(request: NextRequest) {
  if (!isTrustedFormOrigin(request)) return errorRedirect(request, "request");

  const formData = await request.formData();
  const planId = formData.get("plan");
  if (!isBillingPlanId(planId)) return errorRedirect(request, "plan");

  const priceId = getStripePriceId(planId);
  if (!priceId) return errorRedirect(request, "setup");

  try {
    const siteUrl = getSiteUrl(request);
    const user = await getFreshAuthenticatedUser();
    let linkedCustomerId: string | null = null;

    if (user) {
      const account = await getSubscriptionAccountForUser(user.id);
      if (account.allowed) {
        return NextResponse.redirect(new URL("/account?reason=active", request.url), 303);
      }
      linkedCustomerId = account.customerId;
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      payment_method_collection: "always",
      ...(linkedCustomerId
        ? { customer: linkedCustomerId }
        : user?.email
          ? { customer_email: user.email }
          : {}),
      client_reference_id: user?.id,
      success_url: `${siteUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/subscription/cancelled`,
      metadata: { plan_id: planId, ...(user ? { user_id: user.id } : {}) },
      subscription_data: {
        trial_period_days: 7,
        metadata: { plan_id: planId, ...(user ? { user_id: user.id } : {}) },
        trial_settings: {
          end_behavior: { missing_payment_method: "cancel" },
        },
      },
    });

    if (!session.url) return errorRedirect(request, "stripe");
    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error("Unable to create Stripe Checkout session", error);
    return errorRedirect(request, "stripe");
  }
}
