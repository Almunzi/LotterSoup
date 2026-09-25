import { LegalPage } from "../../components/legal-page";
import { createPublicPageMetadata } from "../../lib/seo";
export const metadata = createPublicPageMetadata({
  title: "Refund Policy",
  description: "Review The LotterySoup free-trial, subscription-payment, billing-error, and refund terms.",
  path: "/refund-policy",
});
export default function Page(){return <LegalPage eyebrow="Billing support" title="Refund Policy" intro="We want Stripe subscription billing to be clear and predictable." sections={[
  {title:"Free trial",paragraphs:["New eligible subscribers may receive a seven-day free trial. Unless cancelled before the trial ends, the selected recurring plan will begin automatically at the price disclosed during checkout."]},
  {title:"Subscription payments",paragraphs:["Subscription charges are generally non-refundable once a billing period begins because access to digital content is provided immediately. Cancelling prevents future renewal charges but does not normally reverse a completed charge."]},
  {title:"Billing errors",paragraphs:["If you believe you were charged more than once, charged after a timely cancellation, or charged an incorrect amount, contact team@lotterysoup.com within 14 days of the charge. We will investigate and issue an appropriate refund when we confirm a billing error."]},
  {title:"How refunds are returned",paragraphs:["Approved refunds are sent to the original payment method. Processing time depends on the payment provider and financial institution and may take several business days."]},
  {title:"Your legal rights",paragraphs:["Nothing in this policy limits refund or cancellation rights that cannot be excluded under applicable consumer-protection law."]}
]} />}
