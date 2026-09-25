import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { isSupabaseAuthConfigured } from "../supabase/config";
import { createSupabaseServerClient } from "../supabase/server";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string | null;
};

export const getCurrentUser = cache(async (): Promise<AuthenticatedUser | null> => {
  if (!isSupabaseAuthConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims || typeof claims.sub !== "string" || typeof claims.email !== "string") {
    return null;
  }

  const metadata = claims.user_metadata;
  const name = metadata && typeof metadata === "object" && "full_name" in metadata
    && typeof metadata.full_name === "string"
    ? metadata.full_name
    : null;

  return { id: claims.sub, email: claims.email, name };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function getFreshAuthenticatedUser() {
  if (!isSupabaseAuthConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;

  return data.user;
}
