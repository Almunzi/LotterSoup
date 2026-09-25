import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell nav-wrap">
        <Link href="/" className="brand" aria-label="The LotterySoup home">
          <Image src="/lotterysoup-logo.jpg" width={1024} height={1024} priority alt="The LotterySoup" />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#inside">What&apos;s inside</Link>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="public-nav-actions"><Link href="/login" className="login-link">Subscriber login</Link><Link href="/#pricing" className="button button-small">Start free</Link></div>
      </div>
    </header>
  );
}
