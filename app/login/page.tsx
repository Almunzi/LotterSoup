import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthMessage, AuthShell } from "../../components/auth-shell";
import { PendingForm, PendingSubmitButton } from "../../components/pending-form";
import { getCurrentUser } from "../../lib/auth/session";
import { createPrivatePageMetadata } from "../../lib/seo";

export const metadata = createPrivatePageMetadata("Subscriber Login");

type PageProps = {
  searchParams: Promise<{
    error?: string | string[];
    message?: string | string[];
    session_id?: string | string[];
  }>;
};

const errors: Record<string, string> = {
  credentials: "The email or password is incorrect.",
  verification: "We could not validate that login session. Please sign in again.",
  subscription: "We could not link that subscription to this account.",
  setup: "Subscriber login is still being configured.",
  request: "That sign-in request could not be verified. Please try again.",
};

export default async function LoginPage({ searchParams }: PageProps) {
  if (await getCurrentUser()) redirect("/app");

  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const message = Array.isArray(params.message) ? params.message[0] : params.message;
  const sessionId = Array.isArray(params.session_id) ? params.session_id[0] : params.session_id;

  return <AuthShell eyebrow="Subscriber access" title="Welcome back." copy="Sign in to open your latest LotterySoup update and subscriber archive.">
    {error && <AuthMessage tone="error">{errors[error] || "We could not sign you in."}</AuthMessage>}
    {message === "password" && <AuthMessage tone="success">Your password has been updated. Sign in with the new password.</AuthMessage>}
    <PendingForm className="auth-form" action="/auth/login" method="post">
      {sessionId && <input type="hidden" name="session_id" value={sessionId} />}
      <label htmlFor="email">Email address</label>
      <input id="email" name="email" type="email" autoComplete="email" required />
      <div className="auth-label-row"><label htmlFor="password">Password</label><Link href="/forgot-password">Forgot password?</Link></div>
      <input id="password" name="password" type="password" autoComplete="current-password" required />
      <PendingSubmitButton className="button" pendingLabel="Signing in…">Sign in</PendingSubmitButton>
    </PendingForm>
    <p className="auth-switch">Just subscribed? Use the account link on your Stripe confirmation page.</p>
    <Link className="auth-back" href="/">← Return to LotterySoup</Link>
  </AuthShell>;
}
