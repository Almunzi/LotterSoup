import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthMessage, AuthShell } from "../../components/auth-shell";
import { PendingForm, PendingSubmitButton } from "../../components/pending-form";
import { getCheckoutIdentity } from "../../lib/auth/link-subscription";
import { billingPlans } from "../../lib/billing/plans";
import { createPrivatePageMetadata } from "../../lib/seo";

export const dynamic = "force-dynamic";
export const metadata = createPrivatePageMetadata("Create Subscriber Account");

type PageProps = {
  searchParams: Promise<{ session_id?: string | string[]; error?: string | string[] }>;
};

const errors: Record<string, string> = {
  password: "Use at least 10 characters with at least one letter and one number.",
  mismatch: "The password confirmation does not match.",
  existing: "An account already exists for this email. Sign in to link the subscription.",
  signup: "We could not create the account. Please try again.",
  confirmation: "Direct account activation is not enabled yet. Please contact LotterySoup support.",
  session: "This Stripe subscription could not be verified.",
  setup: "Account creation is still being configured.",
  request: "That account request could not be verified. Please try again.",
};

export default async function SignupPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sessionId = Array.isArray(params.session_id) ? params.session_id[0] : params.session_id;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  if (!sessionId) redirect("/#pricing");

  const identity = await getCheckoutIdentity(sessionId);
  if (!identity) redirect("/subscription/error?reason=session");
  const plan = billingPlans[identity.planId];

  return <AuthShell eyebrow="Finish setting up" title="Create your account." copy="Use the subscribed email below. Your account will be securely linked to the completed Stripe subscription and opened immediately.">
    {error && <AuthMessage tone="error">{errors[error] || "We could not create the account."}</AuthMessage>}
    <div className="auth-plan-summary"><span>Subscription</span><strong>{plan.name} · {plan.price} {plan.period}</strong></div>
    <PendingForm className="auth-form" action="/auth/signup" method="post">
      <input type="hidden" name="session_id" value={sessionId} />
      <label htmlFor="name">Full name</label>
      <input id="name" name="name" defaultValue={identity.name || ""} autoComplete="name" minLength={2} required />
      <label htmlFor="email">Subscribed email</label>
      <input id="email" name="email" type="email" value={identity.email} readOnly aria-readonly="true" />
      <label htmlFor="password">Create password</label>
      <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required />
      <small>At least 10 characters with a letter and number.</small>
      <label htmlFor="confirm_password">Confirm password</label>
      <input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" minLength={10} required />
      <PendingSubmitButton className="button" pendingLabel="Creating your account…">Create subscriber account</PendingSubmitButton>
    </PendingForm>
    <p className="auth-switch">Already have an account? <Link href={`/login?session_id=${encodeURIComponent(sessionId)}`}>Sign in and link it</Link>.</p>
  </AuthShell>;
}
