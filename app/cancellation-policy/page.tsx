import { LegalPage } from "../../components/legal-page";
import { createPublicPageMetadata } from "../../lib/seo";
export const metadata = createPublicPageMetadata({
  title: "Cancellation Policy",
  description: "Learn how to cancel a LotterySoup subscription, when cancellation takes effect, and how to avoid a charge during the free trial.",
  path: "/cancellation-policy",
});
export default function Page(){return <LegalPage eyebrow="You’re in control" title="Cancellation Policy" intro="You may cancel a paid LotterySoup subscription at any time." sections={[
  {title:"How to cancel",paragraphs:["Use the secure Stripe customer portal linked from the Manage Subscription page to cancel your subscription. If you cannot access the portal, send a cancellation request from the subscribed email address to team@lotterysoup.com."]},
  {title:"When cancellation takes effect",paragraphs:["Cancellation stops the next scheduled renewal. You will normally retain access through the end of the billing period already paid for. No further subscription payment will be due unless you subscribe again."]},
  {title:"Cancelling during a free trial",paragraphs:["Cancel before the seven-day trial ends to avoid the first paid charge. The precise trial end and first billing date will be displayed at checkout and in the subscription confirmation."]},
  {title:"Timing",paragraphs:["Submit cancellation before the renewal is processed. Requests received after a renewal has completed apply to the next billing date and are subject to the Refund Policy."]},
  {title:"Confirmation and help",paragraphs:["We will provide confirmation when cancellation is complete. Keep that confirmation for your records. For help, email team@lotterysoup.com."]}
]} />}
