import "server-only";

export const billingPlans = {
  weekly: {
    id: "weekly",
    name: "Weekly",
    price: "$1",
    period: "/ week",
    copy: "Simple, flexible access billed weekly.",
    tone: "weekly",
    stripePriceEnv: "STRIPE_PRICE_WEEKLY",
  },
  monthly: {
    id: "monthly",
    name: "Monthly",
    price: "$4",
    period: "/ month",
    copy: "One easy payment each month.",
    tone: "monthly",
    popular: true,
    stripePriceEnv: "STRIPE_PRICE_MONTHLY",
  },
  annual: {
    id: "annual",
    name: "Annual",
    price: "$50",
    period: "/ year",
    copy: "A full year of LotterySoup access.",
    tone: "annual",
    stripePriceEnv: "STRIPE_PRICE_ANNUAL",
  },
} as const;

export type BillingPlanId = keyof typeof billingPlans;

export function isBillingPlanId(value: unknown): value is BillingPlanId {
  return typeof value === "string" && value in billingPlans;
}

export function getStripePriceId(planId: BillingPlanId) {
  return process.env[billingPlans[planId].stripePriceEnv]?.trim() || null;
}

export function getPlanIdForStripePrice(priceId: string | null | undefined): BillingPlanId | null {
  if (!priceId) return null;

  for (const plan of Object.values(billingPlans)) {
    if (process.env[plan.stripePriceEnv]?.trim() === priceId) return plan.id;
  }

  return null;
}

export function isStripeCheckoutConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
    Object.values(billingPlans).every((plan) => process.env[plan.stripePriceEnv]?.trim()),
  );
}
