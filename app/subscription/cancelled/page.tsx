import { ArrowRight } from "../../../components/icons";
import { SiteFooter } from "../../../components/site-footer";
import { SiteHeader } from "../../../components/site-header";

export const metadata = { title: "Checkout Cancelled" };

export default function CheckoutCancelledPage() {
  return <>
    <SiteHeader />
    <main className="status-main">
      <section className="shell status-card">
        <p className="section-label">No payment was made</p>
        <h1>Checkout cancelled.</h1>
        <p>Your subscription was not started and your card was not charged. You can return to the plans whenever you’re ready.</p>
        <a className="button" href="/#pricing">View plans <ArrowRight /></a>
      </section>
    </main>
    <SiteFooter />
  </>;
}
