import { NextResponse } from "next/server";
import { passwordError } from "../../../lib/auth/validation";
import { isTrustedFormOrigin } from "../../../lib/billing/stripe";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export async function POST(request: Request) {
  if (!isTrustedFormOrigin(request)) return NextResponse.redirect(new URL("/update-password?error=1", request.url), 303);
  const formData = await request.formData();
  const password = String(formData.get("password") || "");
  const confirmation = String(formData.get("confirm_password") || "");
  if (password !== confirmation || passwordError(password)) {
    return NextResponse.redirect(new URL("/update-password?error=1", request.url), 303);
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims.sub) return NextResponse.redirect(new URL("/login", request.url), 303);

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return NextResponse.redirect(new URL("/update-password?error=1", request.url), 303);
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login?message=password", request.url), 303);
}
