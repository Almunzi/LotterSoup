import { LegalPage } from "../../components/legal-page";
import { createPublicPageMetadata } from "../../lib/seo";
export const metadata = createPublicPageMetadata({
  title: "Lottery & Information Disclaimer",
  description: "Read The LotterySoup disclaimer covering official results, number trends, randomized suggestions, responsible play, and service limitations.",
  path: "/disclaimer",
});
export default function Page(){return <LegalPage eyebrow="Please play responsibly" title="Lottery & Information Disclaimer" intro="The LotterySoup is an independent information and entertainment service. Please understand the limits of the content before using it." sections={[
  {title:"No affiliation",paragraphs:["The LotterySoup is not affiliated with, endorsed by, sponsored by, or operated by Powerball, Mega Millions, MUSL, any state lottery, or any government lottery authority. Names and marks belong to their respective owners."]},
  {title:"No guarantee of winning",paragraphs:["Lottery drawings are random. Historical trends, hot or cold numbers, AI-generated numbers, commentary, or any other content cannot predict or improve the chance of winning. No content is a promise or guarantee of a prize."]},
  {title:"Verify official information",paragraphs:["Results, jackpot amounts, rules, odds, drawing times, and claim deadlines can change or contain delays or errors. Always verify all information directly with the applicable official lottery before buying a ticket or claiming a prize."]},
  {title:"Not financial advice",paragraphs:["Content is general entertainment and information, not financial, legal, tax, or gambling advice. You are solely responsible for decisions and spending related to lottery participation."]},
  {title:"Responsible play",paragraphs:["Lottery participation is restricted by age and location. Only play where lawful, set a budget you can afford, never chase losses, and seek local support if gambling stops being fun or feels difficult to control."]}
]} />}
