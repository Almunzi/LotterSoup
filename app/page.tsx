import Image from "next/image";
import { ArrowRight, Check } from "../components/icons";
import { Pricing } from "../components/pricing";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

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
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="kicker">HOT NUMBERS. COLD NUMBERS.</p>
              <h1>Your weekly<br />lottery update.</h1>
              <p className="hero-lead">Powerball and Mega Millions results, number trends, lottery news, and a fun AI number generator—all together in one weekly update.</p>
              <div className="hero-actions">
                <a className="button button-yellow" href="#pricing">Start 7 days free <ArrowRight /></a>
                <a className="plain-link" href="#how-it-works">See how it works</a>
              </div>
              <p className="review-note">Secure subscriptions will open after payment-provider approval.</p>
            </div>
            <div className="newsletter-preview">
              <Image src="/lotterysoup-hero-v2.png" fill sizes="(max-width: 760px) 92vw, 520px" priority alt="Illustration of a fresh serving of lottery information" />
            </div>
          </div>
        </section>

        <section className="service-bar" aria-label="What the newsletter covers">
          <div className="shell service-items"><span>Powerball</span><span>Mega Millions</span><span>Hot & cold numbers</span><span>Lottery news</span></div>
        </section>

        <section className="section how-section" id="how-it-works">
          <div className="shell narrow-heading">
            <p className="section-label">Learn how it works</p>
            <h2>A short introduction to LotterySoup.</h2>
            <p>Watch the explainer video to see what subscribers receive each week.</p>
          </div>
          <div className="shell video-frame">
            <iframe src="https://www.youtube-nocookie.com/embed/qz5wbZB5FBA?rel=0" title="How The LotterySoup works" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
          </div>
        </section>

        <section className="section included-section" id="inside">
          <div className="shell narrow-heading">
            <p className="section-label">What’s inside</p>
            <h2>The information subscribers asked for.</h2>
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
            <div className="sample-image"><Image src="/weekly-roundup-v2.png" width={1672} height={941} sizes="(max-width: 760px) 92vw, 520px" alt="Illustration of a weekly lottery news roundup" /></div>
            <div className="sample-copy">
              <p className="section-label">Easy to scan</p>
              <h2>One straightforward weekly read.</h2>
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
