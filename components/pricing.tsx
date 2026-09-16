import { ArrowRight, Check, Shield } from "./icons";

const plans = [
  { name: "Weekly", price: "$1", period: "/ week", copy: "Simple, flexible access billed weekly." },
  { name: "Monthly", price: "$4", period: "/ month", copy: "One easy payment each month.", popular: true },
  { name: "Annual", price: "$50", period: "/ year", copy: "A full year of LotterySoup access." },
];

export function Pricing() {
  return <section className="section pricing-section" id="pricing">
    <div className="shell">
      <div className="section-heading centered">
        <span className="eyebrow">Simple pricing</span>
        <h2>Start with 7 days free.</h2>
        <p>Choose the schedule that works for you. Every plan includes the same complete weekly update.</p>
      </div>
      <div className="pricing-grid">
        {plans.map((plan) => <article className={`price-card${plan.popular ? " popular" : ""}`} key={plan.name}>
          {plan.popular && <span className="popular-label">Most popular</span>}
          <h3>{plan.name}</h3>
          <div className="price"><strong>{plan.price}</strong><span>{plan.period}</span></div>
          <p>{plan.copy}</p>
          <ul>
            <li><Check />First 7 days free</li>
            <li><Check />Complete weekly update</li>
            <li><Check />Cancel anytime</li>
          </ul>
          <a className={`button${plan.popular ? " button-accent" : " button-outline"}`} href="#launch-note">Start free trial <ArrowRight /></a>
        </article>)}
      </div>
      <div className="launch-note" id="launch-note">
        <Shield />
        <div><strong>Subscriptions are opening soon.</strong><span>Secure checkout will be enabled after our payment partner completes its review. No payment is being collected today.</span></div>
      </div>
    </div>
  </section>;
}
