import { LegalPage } from "../../components/legal-page";
export const metadata = { title: "Refund Policy" };
export default function Page(){return <LegalPage eyebrow="Billing support" title="Refund Policy" intro="We want subscription billing to be clear and predictable. This policy applies once paid subscriptions are available." sections={[
  {title:"Free trial",paragraphs:["New eligible subscribers may receive a seven-day free trial. Unless cancelled before the trial ends, the selected recurring plan will begin automatically at the price disclosed during checkout."]},
  {title:"Subscription payments",paragraphs:["Subscription charges are generally non-refundable once a billing period begins because access to digital content is provided immediately. Cancelling prevents future renewal charges but does not normally reverse a completed charge."]},
  {title:"Billing errors",paragraphs:["If you believe you were charged more than once, charged after a timely cancellation, or charged an incorrect amount, contact support@thelotterysoup.com within 14 days of the charge. We will investigate and issue an appropriate refund when we confirm a billing error."]},
  {title:"How refunds are returned",paragraphs:["Approved refunds are sent to the original payment method. Processing time depends on the payment provider and financial institution and may take several business days."]},
  {title:"Your legal rights",paragraphs:["Nothing in this policy limits refund or cancellation rights that cannot be excluded under applicable consumer-protection law."]}
]} />}
