import Link from "next/link";
import { CreditCard, Shield, User } from "../../components/icons";
import { PendingForm, PendingSubmitButton } from "../../components/pending-form";
import { SubscriberHeader } from "../../components/subscriber-header";
import { requireUser } from "../../lib/auth/session";
import { getSubscriptionAccountForUser } from "../../lib/billing/access";
import { billingPlans, isBillingPlanId } from "../../lib/billing/plans";
import { createPrivatePageMetadata } from "../../lib/seo";

export const dynamic = "force-dynamic";
export const metadata = createPrivatePageMetadata("Account");

type PageProps = {
  searchParams: Promise<{ reason?: string | string[]; error?: string | string[] }>;
};

function formatDate(value: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(value));
}

function readableStatus(status: string, cancelAtPeriodEnd: boolean) {
  if (cancelAtPeriodEnd && status === "active") return "Active · cancels at period end";
  if (status === "none") return "No subscription linked";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default async function AccountPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const account = await getSubscriptionAccountForUser(user.id);
  const params = await searchParams;
  const reason = Array.isArray(params.reason) ? params.reason[0] : params.reason;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const plan = isBillingPlanId(account.planId) ? billingPlans[account.planId] : null;

  return <>
    <SubscriberHeader />
    <main className="subscriber-main account-page">
      <section className="account-hero"><div className="shell"><p className="subscriber-eyebrow">Subscriber settings</p><h1>Your account</h1><p>Review your login details, subscription status, and Stripe billing settings.</p></div></section>
      <section className="shell account-content">
        {reason === "subscription" && <div className="account-alert warning">Your account is signed in, but an active or trialing Stripe subscription is required to open subscriber issues.</div>}
        {reason === "active" && <div className="account-alert success">This account already has subscriber access, so no additional subscription was created.</div>}
        {error && <div className="account-alert error">We could not open billing management. Please try again or contact team@lotterysoup.com.</div>}
        <div className="account-grid">
          <article className="account-card">
            <div className="account-card-title"><User /><div><span>Login details</span><h2>Profile</h2></div></div>
            <dl>
              <div><dt>Name</dt><dd>{user.name || "Subscriber"}</dd></div>
              <div><dt>Email</dt><dd>{user.email}</dd></div>
            </dl>
            <Link className="account-text-link" href="/forgot-password">Reset password</Link>
          </article>
          <article className="account-card subscription-card">
            <div className="account-card-title"><Shield /><div><span>Access</span><h2>Subscription</h2></div></div>
            <dl>
              <div><dt>Status</dt><dd><span className={`account-status status-${account.status}`}>{readableStatus(account.status, account.cancelAtPeriodEnd)}</span></dd></div>
              <div><dt>Plan</dt><dd>{plan ? `${plan.name} · ${plan.price} ${plan.period}` : "Not available"}</dd></div>
              <div><dt>{account.trialEnd ? "Trial ends" : "Current period ends"}</dt><dd>{formatDate(account.trialEnd || account.periodEnd)}</dd></div>
              <div><dt>Latest payment</dt><dd>{account.lastPaymentStatus ? account.lastPaymentStatus.charAt(0).toUpperCase() + account.lastPaymentStatus.slice(1) : "No completed invoice yet"}</dd></div>
            </dl>
            {account.customerId ? <PendingForm action="/api/stripe/account-portal" method="post"><PendingSubmitButton className="button" pendingLabel="Opening Stripe…"><CreditCard /> Manage billing in Stripe</PendingSubmitButton></PendingForm> : <Link className="button" href="/#pricing">Choose a subscription</Link>}
          </article>
        </div>
        <div className="account-bottom-actions">
          {account.allowed && <Link className="button button-outline" href="/app">Return to dashboard</Link>}
          <PendingForm action="/auth/logout" method="post"><PendingSubmitButton className="account-logout" pendingLabel="Logging out…">Log out of LotterySoup</PendingSubmitButton></PendingForm>
        </div>
      </section>
    </main>
  </>;
}
