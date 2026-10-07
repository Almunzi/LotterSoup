import { type NextRequest, NextResponse } from "next/server";
import { isBillingPlanId } from "../../../../lib/billing/plans";
import { getSiteUrl, getStripe, isTrustedFormOrigin } from "../../../../lib/billing/stripe";

export const runtime = "nodejs";

function errorRedirect(request: Request, reason: string) {
  return NextResponse.redirect(new URL(`/subscription/error?reason=${reason}`, request.url), 303);
}

export async function POST(request: NextRequest) {
  if (!isTrustedFormOrigin(request)) return errorRedirect(request, "request");

  const formData = await request.formData();
  const sessionId = formData.get("session_id");
  if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
    return errorRedirect(request, "session");
  }

  try {
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    const customerId = typeof checkoutSession.customer === "string"
      ? checkoutSession.customer
      : checkoutSession.customer?.id;

    if (
      checkoutSession.status !== "complete" ||
      checkoutSession.mode !== "subscription" ||
      !isBillingPlanId(checkoutSession.metadata?.plan_id) ||
      !customerId
    ) {
      return errorRedirect(request, "session");
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getSiteUrl(request)}/subscription/success?session_id=${encodeURIComponent(sessionId)}`,
    });

    return NextResponse.redirect(portalSession.url, 303);
  } catch (error) {
    console.error("Unable to create Stripe customer portal session", error);
    return errorRedirect(request, "portal");
  }
}
