import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

if (!secretKey) {
  throw new Error("Add STRIPE_SECRET_KEY to .env.local before running this setup.");
}

const stripe = new Stripe(secretKey, {
  appInfo: { name: "LotterySoup Setup", version: "1.0.0" },
});

// Stripe Managed Payments requires an eligible product tax code. LotterySoup is
// a recurring, view-only digital periodical, so this is the closest supported
// category. Confirm the final classification with the business's tax adviser.
const productDefinition = {
  name: "LotterySoup Membership",
  description: "Weekly Powerball and Mega Millions results, trends, news, and subscriber updates.",
  tax_code: "txcd_10303002",
  metadata: { application: "lotterysoup" },
};

const products = await stripe.products.list({ active: true, limit: 100 });
let product = products.data.find((item) => item.metadata.application === "lotterysoup");

if (!product) {
  product = await stripe.products.create(productDefinition);
} else {
  // Also repairs products created before Managed Payments required tax codes.
  product = await stripe.products.update(product.id, productDefinition);
}

const desiredPrices = [
  { env: "STRIPE_PRICE_WEEKLY", amount: 100, interval: "week", nickname: "Weekly" },
  { env: "STRIPE_PRICE_MONTHLY", amount: 400, interval: "month", nickname: "Monthly" },
  { env: "STRIPE_PRICE_ANNUAL", amount: 5000, interval: "year", nickname: "Annual" },
];

const existingPrices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
const priceOutput = {};

for (const desired of desiredPrices) {
  let price = existingPrices.data.find((item) =>
    item.currency === "usd" &&
    item.unit_amount === desired.amount &&
    item.recurring?.interval === desired.interval,
  );

  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: desired.amount,
      nickname: `${desired.nickname} LotterySoup membership`,
      recurring: { interval: desired.interval },
      metadata: { application: "lotterysoup", plan: desired.nickname.toLowerCase() },
    });
  }

  priceOutput[desired.env] = price.id;
}

const portalFeatures = {
  customer_update: { enabled: true, allowed_updates: ["email", "name"] },
  invoice_history: { enabled: true },
  payment_method_update: { enabled: true },
  subscription_cancel: {
    enabled: true,
    mode: "at_period_end",
    proration_behavior: "none",
    cancellation_reason: {
      enabled: true,
      options: ["too_expensive", "missing_features", "switched_service", "unused", "other"],
    },
  },
};

const configurations = await stripe.billingPortal.configurations.list({ limit: 100 });
let portal = configurations.data.find((item) => item.metadata.application === "lotterysoup");

const portalParams = {
  business_profile: {
    headline: "Manage your LotterySoup subscription",
    privacy_policy_url: `${siteUrl}/privacy`,
    terms_of_service_url: `${siteUrl}/terms`,
  },
  default_return_url: `${siteUrl}/`,
  features: portalFeatures,
  login_page: { enabled: true },
  metadata: { application: "lotterysoup" },
  name: "LotterySoup customer portal",
};

portal = portal
  ? await stripe.billingPortal.configurations.update(portal.id, portalParams)
  : await stripe.billingPortal.configurations.create(portalParams);

const stripeMode = secretKey.startsWith("sk_live_") ? "live" : "test";
console.log(`Stripe ${stripeMode} configuration is ready. Add these values to .env.local and Vercel:\n`);
for (const [key, value] of Object.entries(priceOutput)) console.log(`${key}=${value}`);
console.log(`STRIPE_PORTAL_CONFIGURATION_ID=${portal.id}`);
console.log(`STRIPE_CUSTOMER_PORTAL_URL=${portal.login_page.url}`);
