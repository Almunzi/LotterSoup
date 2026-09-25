import { NextResponse } from "next/server";
import { isTrustedFormOrigin } from "../../../lib/billing/stripe";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export async function POST(request: Request) {
  if (!isTrustedFormOrigin(request)) return NextResponse.redirect(new URL("/account", request.url), 303);
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
