import { NextResponse } from "next/server";
import { isValidEmail, normalizeEmail } from "../../../lib/auth/validation";
import { getSiteUrl, isTrustedFormOrigin } from "../../../lib/billing/stripe";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export async function POST(request: Request) {
  if (!isTrustedFormOrigin(request)) return NextResponse.redirect(new URL("/forgot-password?error=1", request.url), 303);
  const formData = await request.formData();
  const email = normalizeEmail(String(formData.get("email") || ""));
  if (!isValidEmail(email)) return NextResponse.redirect(new URL("/forgot-password?sent=1", request.url), 303);

  try {
    const supabase = await createSupabaseServerClient();
    const confirmationUrl = new URL("/auth/confirm", getSiteUrl(request));
    confirmationUrl.searchParams.set("next", "/update-password");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: confirmationUrl.toString(),
    });
    if (error) throw error;
    return NextResponse.redirect(new URL("/forgot-password?sent=1", request.url), 303);
  } catch (error) {
    console.error("Unable to request password reset", error);
    return NextResponse.redirect(new URL("/forgot-password?error=1", request.url), 303);
  }
}
