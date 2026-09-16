import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export type LegalSection = { title: string; paragraphs: string[] };

export function LegalPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: LegalSection[] }) {
  return <>
    <SiteHeader />
    <main className="legal-main">
      <section className="legal-hero">
        <div className="shell legal-shell">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
          <small>Effective September 16, 2026</small>
        </div>
      </section>
      <article className="shell legal-content">
        {sections.map((section) => <section key={section.title}>
          <h2>{section.title}</h2>
          {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>)}
      </article>
    </main>
    <SiteFooter />
  </>;
}
