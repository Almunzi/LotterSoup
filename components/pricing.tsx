import { ArrowRight, Check, Shield } from "./icons";
import { PendingForm, PendingSubmitButton } from "./pending-form";
import { billingPlans, isStripeCheckoutConfigured } from "../lib/billing/plans";

export function Pricing() {
  const checkoutReady = isStripeCheckoutConfigured();

  return <section className="section pricing-section" id="pricing">
    <div className="shell">
      <div className="section-heading centered">
        <span className="eyebrow">Simple pricing</span>
        <h2>Start with <span className="text-red">7 days</span> <span className="text-blue">free.</span></h2>
        <p>Choose the schedule that works for you. Every plan includes the same complete weekly update.</p>
      </div>
      <div className="pricing-grid">
        {Object.values(billingPlans).map((plan) => <article className={`price-card price-${plan.tone}${"popular" in plan && plan.popular ? " popular" : ""}`} key={plan.name}>
          {"popular" in plan && plan.popular && <span className="popular-label">Most popular</span>}
          <h3>{plan.name}</h3>
          <div className="price"><strong>{plan.price}</strong><span>{plan.period}</span></div>
          <p>{plan.copy}</p>
          <ul>
            <li><Check />First 7 days free</li>
            <li><Check />Complete weekly update</li>
            <li><Check />Cancel anytime</li>
          </ul>
          <PendingForm action="/api/stripe/checkout" method="post">
            <input type="hidden" name="plan" value={plan.id} />
            <PendingSubmitButton className="button price-button" pendingLabel="Opening secure checkout…" disabled={!checkoutReady}>
              {checkoutReady ? "Start free trial" : "Checkout setup pending"} <ArrowRight />
            </PendingSubmitButton>
          </PendingForm>
        </article>)}
      </div>
      <div className="launch-note" id="launch-note">
        <Shield />
        <div><strong>Secure subscription checkout.</strong><span>Payments are handled by Stripe. LotterySoup never stores your card details, and you can manage or cancel your subscription online.</span></div>
      </div>
    </div>
  </section>;
}
