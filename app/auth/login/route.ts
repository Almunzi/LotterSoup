import { NextResponse } from "next/server";
import { linkCheckoutToUser, linkCustomersForUser } from "../../../lib/auth/link-subscription";
import { isValidEmail, normalizeEmail } from "../../../lib/auth/validation";
import { getSubscriptionAccessForUser } from "../../../lib/billing/access";
import { isTrustedFormOrigin } from "../../../lib/billing/stripe";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

function loginRedirect(request: Request, error: string, sessionId?: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", error);
  if (sessionId) url.searchParams.set("session_id", sessionId);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  if (!isTrustedFormOrigin(request)) return loginRedirect(request, "request");
  const formData = await request.formData();
  const email = normalizeEmail(String(formData.get("email") || ""));
  const password = String(formData.get("password") || "");
  const sessionId = String(formData.get("session_id") || "");
  if (!isValidEmail(email) || !password) return loginRedirect(request, "credentials", sessionId);

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return loginRedirect(request, "credentials", sessionId);

    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) {
      await supabase.auth.signOut();
      return loginRedirect(request, "verification", sessionId);
    }

    try {
      if (sessionId) await linkCheckoutToUser(sessionId, data.user);
      else await linkCustomersForUser(data.user);
    } catch (error) {
      await supabase.auth.signOut();
      throw error;
    }

    const access = await getSubscriptionAccessForUser(data.user.id);
    return NextResponse.redirect(new URL(access.allowed ? "/app" : "/account?reason=subscription", request.url), 303);
  } catch (error) {
    console.error("Unable to sign in subscriber", error);
    return loginRedirect(request, sessionId ? "subscription" : "setup", sessionId);
  }
}
