import type Stripe from "stripe";
import { ArrowRight, Check, Shield } from "../../../components/icons";
import { PendingForm, PendingSubmitButton } from "../../../components/pending-form";
import { SiteFooter } from "../../../components/site-footer";
import { SiteHeader } from "../../../components/site-header";
import { billingPlans, getPlanIdForStripePrice, isBillingPlanId, type BillingPlanId } from "../../../lib/billing/plans";
import { getStripe } from "../../../lib/billing/stripe";
import { subscriptionAllowsAccess } from "../../../lib/billing/subscription-status";
import { linkCheckoutToUser } from "../../../lib/auth/link-subscription";
import { getFreshAuthenticatedUser } from "../../../lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Subscription Confirmed" };

type PageProps = {
  searchParams: Promise<{ session_id?: string | string[] }>;
};

function formatDate(timestamp: number | null) {
  if (!timestamp) return null;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" })
    .format(new Date(timestamp * 1000));
}

export default async function SubscriptionSuccessPage({ searchParams }: PageProps) {
  const user = await getFreshAuthenticatedUser();
  const value = (await searchParams).session_id;
  const sessionId = Array.isArray(value) ? value[0] : value;
  let planId: BillingPlanId | null = null;
  let trialEnds: string | null = null;
  let confirmed = false;

  if (sessionId?.startsWith("cs_")) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId, {
        expand: ["subscription"],
      });
      const subscription = typeof session.subscription === "object"
        ? session.subscription as Stripe.Subscription
        : null;
      const priceId = subscription?.items.data[0]?.price.id;

      const metadataPlan = session.metadata?.plan_id;
      planId = isBillingPlanId(metadataPlan) ? metadataPlan : getPlanIdForStripePrice(priceId);
      trialEnds = formatDate(subscription?.trial_end || null);
      confirmed = session.status === "complete" && Boolean(
        subscription && subscriptionAllowsAccess(subscription.status),
      );

      // Webhooks remain authoritative, but synchronizing here gives a signed-in
      // customer immediate access even if Stripe's webhook delivery is delayed.
      if (confirmed && user && sessionId) {
        try {
          await linkCheckoutToUser(sessionId, user);
        } catch (error) {
          console.error("Unable to link signed-in Checkout session", error);
        }
      }
    } catch (error) {
      console.error("Unable to confirm Stripe Checkout session", error);
    }
  }

  const plan = planId ? billingPlans[planId] : null;

  return <>
    <SiteHeader />
    <main className="status-main">
      <section className="shell status-card">
        <div className={`status-icon${confirmed ? " success" : ""}`}>{confirmed ? <Check /> : <Shield />}</div>
        <p className="section-label">{confirmed ? "Subscription confirmed" : "Confirmation pending"}</p>
        <h1>{confirmed ? "Welcome to LotterySoup." : "We could not confirm this checkout."}</h1>
        {confirmed ? <>
          <p>Your {plan?.name.toLowerCase() || "selected"} subscription is set up. Your first seven days are free{trialEnds ? ` through ${trialEnds}` : ""}.</p>
          <div className="status-details">
            <div><span>Plan</span><strong>{plan ? `${plan.name} · ${plan.price} ${plan.period}` : "LotterySoup subscription"}</strong></div>
            <div><span>Access</span><strong>Active during your free trial</strong></div>
          </div>
          <div className="status-actions">
            <a className="button" href={user ? "/app" : `/signup?session_id=${encodeURIComponent(sessionId || "")}`}>{user ? "Open subscriber app" : "Create subscriber account"} <ArrowRight /></a>
            <PendingForm action="/api/stripe/portal" method="post">
              <input type="hidden" name="session_id" value={sessionId} />
              <PendingSubmitButton className="button button-outline" pendingLabel="Opening Stripe…">Manage billing</PendingSubmitButton>
            </PendingForm>
          </div>
          {!user && <p className="status-footnote">Create your login with the same email used at checkout to open the subscriber app.</p>}
        </> : <>
          <p>The payment may still be processing, or this confirmation link may be incomplete. Please check your Stripe receipt or contact team@lotterysoup.com.</p>
          <a className="button" href="/#pricing">Return to pricing</a>
        </>}
      </section>
    </main>
    <SiteFooter />
  </>;
}
