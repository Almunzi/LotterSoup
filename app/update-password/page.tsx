import { redirect } from "next/navigation";
import { AuthMessage, AuthShell } from "../../components/auth-shell";
import { PendingForm, PendingSubmitButton } from "../../components/pending-form";
import { getCurrentUser } from "../../lib/auth/session";
import { createPrivatePageMetadata } from "../../lib/seo";

export const metadata = createPrivatePageMetadata("Choose New Password");

type PageProps = { searchParams: Promise<{ error?: string | string[] }> };

export default async function UpdatePasswordPage({ searchParams }: PageProps) {
  if (!await getCurrentUser()) redirect("/login");
  const error = Boolean((await searchParams).error);

  return <AuthShell eyebrow="Account security" title="Choose a new password." copy="Your new password will replace the previous password immediately.">
    {error && <AuthMessage tone="error">Use at least 10 characters with at least one letter and one number, and make sure both entries match.</AuthMessage>}
    <PendingForm className="auth-form" action="/auth/update-password" method="post">
      <label htmlFor="password">New password</label>
      <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required />
      <label htmlFor="confirm_password">Confirm new password</label>
      <input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" minLength={10} required />
      <PendingSubmitButton className="button" pendingLabel="Updating password…">Update password</PendingSubmitButton>
    </PendingForm>
  </AuthShell>;
}
