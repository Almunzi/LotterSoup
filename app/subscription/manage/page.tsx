import { ArrowRight, Shield } from "../../../components/icons";
import { SiteFooter } from "../../../components/site-footer";
import { SiteHeader } from "../../../components/site-header";

export const dynamic = "force-dynamic";
export const metadata = { title: "Manage Subscription" };

export default function ManageSubscriptionPage() {
  const portalUrl = process.env.STRIPE_CUSTOMER_PORTAL_URL?.trim();

  return <>
    <SiteHeader />
    <main className="status-main">
      <section className="shell status-card">
        <div className="status-icon"><Shield /></div>
        <p className="section-label">Stripe customer portal</p>
        <h1>Manage your subscription.</h1>
        <p>Use Stripe’s secure customer portal to update your payment method, view invoices, or cancel your LotterySoup subscription.</p>
        {portalUrl ? <a className="button" href={portalUrl}>Open secure portal <ArrowRight /></a> : <>
          <p className="status-notice">The customer portal is being connected. Until it is available, email team@lotterysoup.com for subscription help.</p>
          <a className="button" href="mailto:team@lotterysoup.com">Email the LotterySoup team</a>
        </>}
      </section>
    </main>
    <SiteFooter />
  </>;
}
