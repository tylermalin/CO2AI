# AI Carbon Control Plane — Onboarding Architecture

## 1. Primary User Personas

| Persona | Context | Primary Goal |
|---------|---------|--------------|
| **Startup founder** | Early-stage, AI-first product, budget-conscious | "What's our carbon footprint? Can we afford to care?" |
| **AI engineering team** | Shipping models to prod, optimizing infra | "How do we measure and reduce emissions without slowing down?" |
| **Enterprise sustainability lead** | ESG reporting, compliance, net-zero targets | "How do we govern AI emissions across teams?" |

---

## 2. First 2 Minutes — What Each Persona Wants

| Persona | First 2 minutes |
|---------|------------------|
| **Startup founder** | A number. "We emit ~X kg CO₂/month." Equivalent to Y flights. No signup. |
| **AI engineering team** | Proof it works. "Here's how we'd estimate your emissions." Code snippet optional. |
| **Enterprise sustainability lead** | Credibility. "How is this calculated?" Methodology visible. Trust signals. |

---

## 3. Friction Points in Proxy-Based Integration

| Friction | Impact | Mitigation |
|---------|--------|------------|
| **Changing base URL** | Devs fear breaking prod | Show exact code diff. Live test before cutover. |
| **API key management** | Security concerns | "We never store your key." Org-scoped keys. Read-only mode first. |
| **Trust in calculation** | "How do you know?" | Transparency panel. Methodology. Uncertainty ranges. |
| **Time to value** | "Why integrate now?" | Instant calculator first. No integration required. |
| **Proxy = single point of failure** | Reliability concern | Explain fallback. Latency impact minimal. |

---

## 4. Four-Step Onboarding Funnel

```
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: ACCOUNT CREATION                                                │
│  • Email + magic link (no passwords)                                     │
│  • Auto-create default org                                                │
│  • Minimal JWT session                                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: INSTANT VALUE                                                   │
│  • Quick carbon calculator (spend → CO₂)                                 │
│  • No integration. No signup required to see first estimate.             │
│  • Time to first carbon read: < 90 seconds                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: TRUST BUILDING                                                  │
│  • Connect API key (read-only)                                           │
│  • See real footprint from actual usage                                  │
│  • Transparency panel: methodology, assumptions, uncertainty              │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4: INFRASTRUCTURE ADOPTION                                         │
│  • Proxy mode activation                                                 │
│  • Carbon budget setup                                                   │
│  • Optimization education                                               │
│  • Time to proxy activation: < 5 minutes                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Perfect Onboarding (Definition)

**Perfect onboarding** for this product means:

1. **< 90 seconds to first carbon read** — User lands, enters spend, sees estimate. No signup.
2. **< 5 minutes to proxy activation** — For users who want to integrate, the wizard is short and actionable.
3. **Zero jargon** — "Proxy mode" explained in one sentence. "Carbon intensity" linked to methodology.
4. **Progressive commitment** — Calculator → Account → API key → Proxy → Budget. Each step optional.
5. **Trust-first** — Methodology visible upfront. No marketing language.
6. **Governance feels empowering** — Budgets feel like control, not restriction.

---

## 6. End-to-End Flow

```
1. Landing page
2. Instant carbon calculator (no signup)
3. Magic link signup
4. Connect API key
5. See real footprint
6. Activate proxy
7. Set carbon budget
8. Monitor & optimize
```

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Time to first carbon read | < 90 sec |
| Time to proxy activation | < 5 min |
| Calculator → Signup conversion | Track |
| Signup → API key connect | Track |
| API key → Proxy activation | Track |

---

## 8. Strategic Note

> If built correctly, this onboarding itself becomes your moat. Most AI tools will never offer carbon governance, real-time routing, budget enforcement, or optimization insights. Nail onboarding = category-defining.
