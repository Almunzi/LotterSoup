import Link from "next/link";
import { Newspaper } from "../../components/icons";
import { createPrivatePageMetadata } from "../../lib/seo";

export const metadata = createPrivatePageMetadata("You Are Offline");

export default function OfflinePage() {
  return <main className="offline-page">
    <div className="offline-card"><Newspaper /><p className="section-label">LotterySoup</p><h1>You&apos;re offline.</h1><p>Reconnect to the internet to securely load your subscriber issues and account information.</p><Link className="button" href="/app">Try again</Link></div>
  </main>;
}
