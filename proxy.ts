import { type NextRequest, NextResponse } from "next/server";
import { updateSupabaseSession } from "./lib/supabase/proxy";
import { isSupabaseAuthConfigured } from "./lib/supabase/config";

export async function proxy(request: NextRequest) {
  // Keep the public marketing site available while a new environment is being
  // configured. Protected pages still reject unauthenticated requests.
  if (!isSupabaseAuthConfigured()) return NextResponse.next({ request });
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
