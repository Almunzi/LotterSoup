import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { createPublicPageMetadata } from "../../lib/seo";

export const metadata = createPublicPageMetadata({
  title: "Contact",
  description: "Contact The LotterySoup team for help with your newsletter, subscriber account, Stripe billing, or subscription.",
  path: "/contact",
});

export default function Page(){return <><SiteHeader/><main className="legal-main"><section className="legal-hero"><div className="shell legal-shell"><span className="eyebrow light">We’re here to help</span><h1>Contact The LotterySoup</h1><p>Have a question about the newsletter, your subscription, or your account? Send us a message and we’ll help.</p></div></section><section className="section"><div className="shell contact-grid"><article className="contact-card"><h2>Customer support</h2><p>Email is the fastest way to reach us. Please include the email address connected to your subscription so we can locate your account.</p><a href="mailto:team@lotterysoup.com">team@lotterysoup.com</a><div className="contact-list"><div><span>Response time</span><strong>Usually within 1–2 business days</strong></div><div><span>Service</span><strong>The LotterySoup</strong></div></div></article><article className="contact-card"><h2>Before you write</h2><p>You can manage or cancel your subscription from the secure Stripe billing portal available on your account page.</p><p>For lottery results, ticket purchases, prize claims, or official drawing rules, contact the relevant official lottery directly. The LotterySoup does not sell tickets or administer drawings.</p></article></div></section></main><SiteFooter/></>}
