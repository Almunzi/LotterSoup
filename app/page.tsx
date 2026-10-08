import Image from "next/image";
import { ArrowRight, Check } from "../components/icons";
import { Pricing } from "../components/pricing";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { createPublicPageMetadata, siteDescription, siteName, siteUrl } from "../lib/seo";

export const metadata = createPublicPageMetadata({
  title: "Weekly Powerball & Mega Millions Update",
  description: siteDescription,
  path: "/",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/app-icon-512.png`,
      email: "team@lotterysoup.com",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: siteName,
      url: siteUrl,
      description: siteDescription,
      inLanguage: "en-US",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "Service",
      "@id": `${siteUrl}/#newsletter`,
      name: "The LotterySoup Weekly Lottery Update",
      description: siteDescription,
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: "US",
      offers: [
        { "@type": "Offer", name: "Weekly subscription", price: "1.00", priceCurrency: "USD" },
        { "@type": "Offer", name: "Monthly subscription", price: "4.00", priceCurrency: "USD" },
        { "@type": "Offer", name: "Annual subscription", price: "50.00", priceCurrency: "USD" },
      ],
    },
  ],
};

const sections = [
  { number: "1", title: "Powerball", label: "Previous draw result", copy: "A clear recap of the latest winning numbers and advertised jackpot.", className: "powerball" },
  { number: "2", title: "Mega Millions", label: "Previous draw result", copy: "The latest numbers and jackpot information in the same easy format.", className: "mega" },
  { number: "3", title: "Hot & cold numbers", label: "Powerball trends", copy: "A simple look at recently frequent and less frequent Powerball numbers.", className: "trends" },
  { number: "4", title: "Hot & cold numbers", label: "Mega Millions trends", copy: "The same recent number-frequency view for Mega Millions.", className: "trends-mega" },
  { number: "5", title: "AI number generator", label: "Just for fun", copy: "Generate a fresh randomized set of numbers whenever you want inspiration.", className: "generator" },
  { number: "6", title: "Lottery news", label: "Stay informed", copy: "Important lottery stories, jackpot news, and other useful updates.", className: "news" },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="kicker">HOT NUMBERS. COLD NUMBERS.</p>
              <h1><span className="headline-white">Your</span> <span className="headline-yellow">weekly</span><br /><span className="headline-cyan">lottery</span><br /><span className="headline-red">update.</span></h1>
              <p className="hero-lead">Powerball and Mega Millions results, number trends, lottery news, and a fun AI number generator—all together in one weekly update.</p>
              <div className="hero-actions">
                <a className="button button-yellow" href="#pricing">Start 7 days free <ArrowRight /></a>
                <a className="plain-link" href="#how-it-works">See how it works</a>
              </div>
              <p className="review-note">Seven days free. Secure checkout. Cancel anytime.</p>
            </div>
            <div className="newsletter-preview">
              <Image src="/lotterysoup-hero-v3.png" fill sizes="(max-width: 760px) 92vw, 520px" priority alt="Lottery tickets, number slips, and pamphlets rising from a fresh bowl of lottery information" />
            </div>
          </div>
        </section>

        <section className="service-bar" aria-label="What the newsletter covers">
          <div className="shell service-items"><span>Powerball</span><span>Mega Millions</span><span>Hot & cold numbers</span><span>Lottery news</span></div>
        </section>

        <section className="section how-section" id="how-it-works">
          <div className="shell narrow-heading">
            <p className="section-label">Learn how it works</p>
            <h2>A short <span className="text-blue">introduction</span> to <span className="text-purple">LotterySoup.</span></h2>
            <p>Watch the explainer video to see what subscribers receive each week.</p>
          </div>
          <div className="shell how-media-grid">
            <div className="video-frame">
              <iframe src="https://www.youtube-nocookie.com/embed/bmjrzOUUWaE?rel=0" title="LotterySoup short introduction" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            </div>
            <div className="party-image">
              <Image src="/lottery-party-v3.png" width={1254} height={1254} sizes="(max-width: 880px) 92vw, 420px" alt="Colorful lottery celebration with tickets, pamphlets, ribbons, and a steaming cup" />
            </div>
          </div>
        </section>

        <section className="section included-section" id="inside">
          <div className="shell narrow-heading">
            <p className="section-label">What’s inside</p>
            <h2>The <span className="text-red">information</span> subscribers <span className="text-blue">asked for.</span></h2>
            <p>Each weekly issue follows the clear, colorful format from the original Mailchimp newsletter.</p>
          </div>
          <div className="shell feature-grid">
            {sections.map((item) => (
              <article className={`feature-card ${item.className}`} key={`${item.number}-${item.label}`}>
                <span className="section-number">{item.number}</span>
                <div><p>{item.label}</p><h3>{item.title}</h3><span>{item.copy}</span></div>
              </article>
            ))}
          </div>
        </section>

        <section className="section sample-section">
          <div className="shell sample-grid">
            <div className="sample-image"><Image src="/weekly-roundup-v3.png" width={1672} height={941} sizes="(max-width: 760px) 92vw, 520px" alt="Illustration of a weekly lottery news roundup with tickets, number slips, and printed charts" /></div>
            <div className="sample-copy">
              <p className="section-label">Easy to scan</p>
              <h2>One straightforward <span className="text-purple">weekly read.</span></h2>
              <p>LotterySoup organizes the week’s information into short sections, so subscribers can find the parts they care about without searching several sites.</p>
              <ul><li><Check />Works on phone, tablet, and desktop</li><li><Check />Sent as a weekly email update</li><li><Check />Official results should always be verified</li></ul>
            </div>
          </div>
        </section>

        <Pricing />
      </main>
      <SiteFooter />
    </>
  );
}
