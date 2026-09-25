import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { safeInternalPath } from "../../../lib/auth/validation";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

const allowedOtpTypes = new Set<EmailOtpType>([
  "signup", "invite", "magiclink", "recovery", "email_change", "email",
]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const rawType = url.searchParams.get("type");
  const next = safeInternalPath(url.searchParams.get("next"));

  try {
    const supabase = await createSupabaseServerClient();
    let error = null;

    if (code) {
      ({ error } = await supabase.auth.exchangeCodeForSession(code));
    } else if (tokenHash && rawType && allowedOtpTypes.has(rawType as EmailOtpType)) {
      ({ error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: rawType as EmailOtpType,
      }));
    } else {
      return NextResponse.redirect(new URL("/login?error=verification", request.url), 303);
    }

    if (error) throw error;
    return NextResponse.redirect(new URL(next, request.url), 303);
  } catch (error) {
    console.error("Unable to confirm Supabase authentication", error);
    return NextResponse.redirect(new URL("/login?error=verification", request.url), 303);
  }
}
