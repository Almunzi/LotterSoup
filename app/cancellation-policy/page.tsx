import { LegalPage } from "../../components/legal-page";
export const metadata = { title: "Cancellation Policy" };
export default function Page(){return <LegalPage eyebrow="You’re in control" title="Cancellation Policy" intro="You may cancel a paid LotterySoup subscription at any time once subscriptions are live." sections={[
  {title:"How to cancel",paragraphs:["When account access launches, subscribers will be able to cancel from their account page. Until that feature is available, cancellation requests may be sent from the subscribed email address to support@thelotterysoup.com."]},
  {title:"When cancellation takes effect",paragraphs:["Cancellation stops the next scheduled renewal. You will normally retain access through the end of the billing period already paid for. No further subscription payment will be due unless you subscribe again."]},
  {title:"Cancelling during a free trial",paragraphs:["Cancel before the seven-day trial ends to avoid the first paid charge. The precise trial end and first billing date will be displayed at checkout and in the subscription confirmation."]},
  {title:"Timing",paragraphs:["Submit cancellation before the renewal is processed. Requests received after a renewal has completed apply to the next billing date and are subject to the Refund Policy."]},
  {title:"Confirmation and help",paragraphs:["We will provide confirmation when cancellation is complete. Keep that confirmation for your records. For help, email support@thelotterysoup.com."]}
]} />}
