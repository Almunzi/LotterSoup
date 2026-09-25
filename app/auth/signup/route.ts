import { NextResponse } from "next/server";
import { getCheckoutIdentity, linkCheckoutToUser } from "../../../lib/auth/link-subscription";
import { passwordError } from "../../../lib/auth/validation";
import { isTrustedFormOrigin } from "../../../lib/billing/stripe";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

function signupRedirect(request: Request, sessionId: string, error: string) {
  const url = new URL("/signup", request.url);
  url.searchParams.set("session_id", sessionId);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  if (!isTrustedFormOrigin(request)) return NextResponse.redirect(new URL("/signup?error=request", request.url), 303);
  const formData = await request.formData();
  const sessionId = String(formData.get("session_id") || "");
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmation = String(formData.get("confirm_password") || "");
  const identity = await getCheckoutIdentity(sessionId);

  if (!identity) return signupRedirect(request, sessionId, "session");
  if (name.length < 2 || passwordError(password)) return signupRedirect(request, sessionId, "password");
  if (password !== confirmation) return signupRedirect(request, sessionId, "mismatch");

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: identity.email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      const code = error.code === "user_already_exists" || error.message.toLowerCase().includes("already")
        ? "existing"
        : "signup";
      return signupRedirect(request, sessionId, code);
    }

    if (data.user && data.user.identities?.length === 0) {
      return signupRedirect(request, sessionId, "existing");
    }

    if (data.session && data.user) {
      await linkCheckoutToUser(sessionId, data.user);
      return NextResponse.redirect(new URL("/app", request.url), 303);
    }

    return signupRedirect(request, sessionId, "confirmation");
  } catch (error) {
    console.error("Unable to create subscriber account", error);
    return signupRedirect(request, sessionId, "setup");
  }
}
