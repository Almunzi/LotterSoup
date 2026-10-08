import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Shield } from "../../../components/icons";
import { SiteFooter } from "../../../components/site-footer";
import { SiteHeader } from "../../../components/site-header";
import { getCurrentUser } from "../../../lib/auth/session";

export const metadata = { title: "Manage Subscription" };

export default async function ManageSubscriptionPage() {
  if (await getCurrentUser()) redirect("/account");

  return <>
    <SiteHeader />
    <main className="status-main">
      <section className="shell status-card">
        <div className="status-icon"><Shield /></div>
        <p className="section-label">Stripe customer portal</p>
        <h1>Manage your subscription.</h1>
        <p>Sign in to your LotterySoup account, then use <strong>Manage billing in Stripe</strong> to update your payment method, view invoices, or cancel your subscription.</p>
        <Link className="button" href="/login">Sign in to manage billing <ArrowRight /></Link>
        <p className="status-notice">If you cannot access your account, email team@lotterysoup.com from the address used for the subscription.</p>
      </section>
    </main>
    <SiteFooter />
  </>;
}
