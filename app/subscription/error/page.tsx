import { SiteFooter } from "../../../components/site-footer";
import { SiteHeader } from "../../../components/site-header";

export const metadata = { title: "Subscription Help" };

type PageProps = {
  searchParams: Promise<{ reason?: string | string[] }>;
};

const messages: Record<string, string> = {
  setup: "Secure checkout is still being configured. Please try again shortly.",
  plan: "That subscription option could not be found.",
  request: "This checkout request could not be verified.",
  session: "This subscription session could not be verified.",
  portal: "We could not open the billing portal right now.",
  stripe: "Stripe checkout is temporarily unavailable.",
};

export default async function SubscriptionErrorPage({ searchParams }: PageProps) {
  const value = (await searchParams).reason;
  const reason = Array.isArray(value) ? value[0] : value;

  return <>
    <SiteHeader />
    <main className="status-main">
      <section className="shell status-card">
        <p className="section-label">Subscription help</p>
        <h1>We couldn’t continue.</h1>
        <p>{messages[reason || ""] || "Something interrupted the subscription process."} No payment was collected. Please try again or email team@lotterysoup.com.</p>
        <div className="status-actions">
          <a className="button" href="/#pricing">Return to pricing</a>
          <a className="button button-outline" href="mailto:team@lotterysoup.com">Contact us</a>
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
