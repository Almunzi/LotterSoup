const required = [
  "NEXT_PUBLIC_SITE_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_WEEKLY",
  "STRIPE_PRICE_MONTHLY",
  "STRIPE_PRICE_ANNUAL",
  "STRIPE_PORTAL_CONFIGURATION_ID",
  "STRIPE_CUSTOMER_PORTAL_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
  "MAILCHIMP_API_KEY",
  "MAILCHIMP_AUDIENCE_ID",
  "CRON_SECRET",
];

const errors = [];
const warnings = [];

function value(name) {
  return process.env[name]?.trim() || "";
}

function expect(name, condition, message) {
  if (value(name) && !condition(value(name))) errors.push(`${name}: ${message}`);
}

for (const name of required) {
  if (!value(name) || /replace[_-]?me/i.test(value(name))) errors.push(`${name}: missing or still contains a placeholder`);
}

expect("NEXT_PUBLIC_SITE_URL", (item) => {
  try {
    const url = new URL(item);
    return url.protocol === "https:" && !url.pathname.replace(/\/$/, "");
  } catch {
    return false;
  }
}, "must be the HTTPS production origin without a path");
expect("STRIPE_SECRET_KEY", (item) => item.startsWith("sk_live_"), "must be a Stripe live-mode secret key");
expect("STRIPE_WEBHOOK_SECRET", (item) => item.startsWith("whsec_"), "must be the production endpoint signing secret");
for (const name of ["STRIPE_PRICE_WEEKLY", "STRIPE_PRICE_MONTHLY", "STRIPE_PRICE_ANNUAL"]) {
  expect(name, (item) => item.startsWith("price_"), "must be a Stripe Price ID");
}
expect("STRIPE_PORTAL_CONFIGURATION_ID", (item) => item.startsWith("bpc_"), "must be a billing portal configuration ID");
expect("STRIPE_CUSTOMER_PORTAL_URL", (item) => item.startsWith("https://billing.stripe.com/"), "must be the hosted Stripe portal URL");
expect("NEXT_PUBLIC_SUPABASE_URL", (item) => /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(item), "must be the Supabase project URL");
expect("SUPABASE_URL", (item) => /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(item), "must be the Supabase project URL");
expect("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", (item) => item.startsWith("sb_publishable_") || item.startsWith("eyJ"), "must be the publishable/anon key");
expect("SUPABASE_SECRET_KEY", (item) => item.startsWith("sb_secret_") || item.startsWith("eyJ"), "must be the server-only secret/service-role key");
expect("MAILCHIMP_API_KEY", (item) => /-[a-z]{2,4}\d+$/i.test(item), "must include its data-center suffix, such as -us21");
expect("CRON_SECRET", (item) => item.length >= 32, "must contain at least 32 characters");

if (value("NEXT_PUBLIC_SUPABASE_URL") && value("SUPABASE_URL")
  && value("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "") !== value("SUPABASE_URL").replace(/\/$/, "")) {
  errors.push("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_URL must identify the same project");
}

const mailchimpPrefix = value("MAILCHIMP_SERVER_PREFIX") || value("MAILCHIMP_API_KEY").split("-").at(-1) || "";
if (!/^[a-z]{2,4}\d+$/i.test(mailchimpPrefix)) errors.push("MAILCHIMP_SERVER_PREFIX: missing or invalid");
if (value("MAILCHIMP_API_KEY") && !value("MAILCHIMP_API_KEY").endsWith(`-${mailchimpPrefix}`)) {
  errors.push("MAILCHIMP_SERVER_PREFIX does not match the API-key suffix");
}

const mailchimpStatus = value("MAILCHIMP_NEW_MEMBER_STATUS") || "pending";
if (!["pending", "subscribed", "transactional"].includes(mailchimpStatus)) {
  errors.push("MAILCHIMP_NEW_MEMBER_STATUS must be pending, subscribed, or transactional");
}
if (mailchimpStatus === "subscribed") {
  warnings.push("MAILCHIMP_NEW_MEMBER_STATUS is subscribed; confirm that explicit newsletter consent is collected and documented");
}

if (errors.length) {
  console.error("LotterySoup production configuration is NOT ready:\n");
  for (const error of errors) console.error(`- ${error}`);
  if (warnings.length) {
    console.error("\nWarnings:");
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

console.log("LotterySoup production environment passed all required checks.");
for (const warning of warnings) console.warn(`Warning: ${warning}`);
