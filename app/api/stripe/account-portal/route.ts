import { type NextRequest, NextResponse } from "next/server";
import { getFreshAuthenticatedUser } from "../../../../lib/auth/session";
import { getSubscriptionAccountForUser } from "../../../../lib/billing/access";
import { getSiteUrl, getStripe, isTrustedFormOrigin } from "../../../../lib/billing/stripe";

export const runtime = "nodejs";

function accountRedirect(request: Request, reason: string) {
  const url = new URL("/account", request.url);
  url.searchParams.set("error", reason);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: NextRequest) {
  if (!isTrustedFormOrigin(request)) return accountRedirect(request, "request");

  try {
    const user = await getFreshAuthenticatedUser();
    if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);

    const account = await getSubscriptionAccountForUser(user.id);
    if (!account.customerId) return accountRedirect(request, "subscription");

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: account.customerId,
      configuration: process.env.STRIPE_PORTAL_CONFIGURATION_ID?.trim() || undefined,
      return_url: `${getSiteUrl(request)}/account`,
    });

    return NextResponse.redirect(portalSession.url, 303);
  } catch (error) {
    console.error("Unable to create authenticated Stripe portal session", error);
    return accountRedirect(request, "portal");
  }
}
