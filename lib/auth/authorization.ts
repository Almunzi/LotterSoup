import "server-only";

import { redirect } from "next/navigation";
import { getSubscriptionAccessForUser } from "../billing/access";
import { requireUser } from "./session";

export async function requireSubscriber() {
  const user = await requireUser();
  const access = await getSubscriptionAccessForUser(user.id);

  if (!access.allowed) redirect("/account?reason=subscription");
  return { user, access };
}
