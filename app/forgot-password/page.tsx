import Link from "next/link";
import { AuthMessage, AuthShell } from "../../components/auth-shell";
import { PendingForm, PendingSubmitButton } from "../../components/pending-form";
import { createPrivatePageMetadata } from "../../lib/seo";

export const metadata = createPrivatePageMetadata("Reset Password");

type PageProps = { searchParams: Promise<{ sent?: string | string[]; error?: string | string[] }> };

export default async function ForgotPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sent = Boolean(params.sent);
  const error = Boolean(params.error);

  return <AuthShell eyebrow="Account recovery" title="Reset your password." copy="Enter your subscriber email and we’ll send a secure password reset link.">
    {sent && <AuthMessage tone="success">If an account exists for that email, a reset link has been sent.</AuthMessage>}
    {error && <AuthMessage tone="error">We could not send the reset email. Please try again shortly.</AuthMessage>}
    <PendingForm className="auth-form" action="/auth/forgot-password" method="post">
      <label htmlFor="email">Email address</label>
      <input id="email" name="email" type="email" autoComplete="email" required />
      <PendingSubmitButton className="button" pendingLabel="Sending reset link…">Send reset link</PendingSubmitButton>
    </PendingForm>
    <Link className="auth-back" href="/login">← Back to login</Link>
  </AuthShell>;
}
