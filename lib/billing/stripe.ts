import "server-only";

import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      appInfo: {
        name: "LotterySoup",
        version: "1.0.0",
      },
    });
  }

  return stripeClient;
}

export function getSiteUrl(request?: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const fallbackUrl = request ? new URL(request.url).origin : "http://localhost:3000";
  return (configuredUrl || fallbackUrl).replace(/\/$/, "");
}

export function isTrustedFormOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const requestOrigin = new URL(request.url).origin;
  const configuredOrigin = new URL(getSiteUrl(request)).origin;
  return origin === requestOrigin || origin === configuredOrigin;
}
