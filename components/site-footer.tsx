import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-color-band" aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>
      <div className="shell footer-grid">
        <div className="footer-brand footer-panel footer-panel-brand">
          <Link href="/" aria-label="The LotterySoup home"><Image src="/lotterysoup-logo.jpg" width={1024} height={1024} alt="The LotterySoup" /></Link>
          <p>Your weekly serving of lottery information, trends, and updates.</p>
        </div>
        <div className="footer-panel footer-panel-explore">
          <h3>Explore</h3>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#inside">What&apos;s inside</Link>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/login">Subscriber Login</Link>
        </div>
        <div className="footer-panel footer-panel-legal">
          <h3>Legal</h3>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/refund-policy">Refund Policy</Link>
          <Link href="/cancellation-policy">Cancellation Policy</Link>
          <Link href="/subscription/manage">Manage Subscription</Link>
          <Link href="/disclaimer">Lottery Disclaimer</Link>
        </div>
        <div className="footer-note footer-panel footer-panel-note">
          <h3>Stay informed</h3>
          <p>Always check official lottery sources for verified results and drawing information.</p>
          <span>18+ only · Play responsibly</span>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} The LotterySoup.com . All rights reserved.</span>
        <span>Good information. Good fun. Good luck.</span>
      </div>
    </footer>
  );
}
