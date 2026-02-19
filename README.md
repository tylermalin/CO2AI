# AICo2

**Carbon Accounting & Governance for AI Inference**

AI is scaling rapidly. Its operational carbon footprint is largely invisible.

AICo2 is an open, research-driven framework for estimating, tracking, and governing the energy use and associated CO₂ emissions of large language model (LLM) inference workloads.

A Mālama Labs project. Applies digital MRV (Measurement, Reporting, and Verification) principles to AI infrastructure.

---

## Why AICo2?

As AI inference becomes embedded in applications, workflows, and infrastructure:

- Engineering teams track tokens and cost.
- Sustainability teams track electricity procurement.
- Few organizations track inference emissions per request.

AICo2 bridges that gap by attaching carbon intelligence directly to AI operations.

---

## What It Does

AICo2 provides:

- Per-request energy and CO₂ estimation
- Organization-level emissions tracking
- Carbon budget enforcement
- Carbon-aware inference routing
- Optimization insights
- Research-backed probabilistic modeling
- Industry-level carbon outlook modeling

All built using transparent assumptions and documented methodology.

---

## Architecture Overview

```
Client Application
        ↓
AICo2 Proxy (OpenAI-compatible)
        ↓
Upstream LLM Provider
```

At each inference call, AICo2:

1. Estimates FLOPs based on token usage.
2. Converts compute to energy using hardware efficiency assumptions.
3. Applies data center overhead (PUE).
4. Applies grid carbon intensity (location-based or marginal).
5. Logs results.
6. Optionally enforces carbon budgets.
7. Optionally routes to lower-carbon regions.

---

## Research Basis

AICo2 builds on established work in machine learning energy reporting and software carbon accounting:

- Henderson et al., 2020 – Systematic reporting of ML energy and carbon footprints (JMLR)
- Strubell et al., 2019 – Energy considerations for NLP
- Patterson et al., 2021 – Carbon emissions in large neural network systems
- Green Software Foundation – Software Carbon Intensity (SCI) Specification
- GHG Protocol – Scope 2 accounting guidance

The goal is not perfect measurement, but transparent, defensible estimation.

---

## Core Features

### 1. Carbon Estimation Engine

- FLOPs-based modeling
- Hardware efficiency calibration
- Data center PUE adjustments
- Configurable carbon intensity
- Uncertainty modeling (Monte Carlo simulation)

### 2. Carbon Budgets

Organizations can:

- Set monthly CO₂ limits
- Enable monitoring mode
- Enable soft warnings
- Enable hard enforcement

Carbon becomes a governed operational metric.

### 3. Carbon-Aware Routing

AICo2 can evaluate:

- Real-time grid carbon intensity
- Model energy characteristics
- Regional differences

Then route inference to lower-carbon regions where available.

### 4. AI Carbon Outlook 2026

Interactive industry-level carbon modeling with:

- Adjustable usage assumptions
- Uncertainty bands
- Monte Carlo simulation
- Policy brief PDF export

---

## Getting Your Request History

To see emissions and model usage in the dashboard:

1. **Sign up** and complete onboarding (creates your organization).
2. **Run a demo** from the dashboard to log a sample request.
3. **Route your app** through the AICo2 proxy:
   - Set your OpenAI base URL to the proxy (e.g. `https://your-backend.example.com/v1`)
   - Add header: `X-Organization-Id: <your-org-id>`

Your org ID is shown on the dashboard. All emissions attributed to that org appear in your request history, daily totals, and optimization insights.

---

## Installation

### Backend

```bash
git clone https://github.com/tylermalin/AIC02.git
cd AIC02/backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker (Recommended)

```bash
docker compose up --build
```

---

## Configuration

Set environment variables:

```
DATABASE_URL=
OPENAI_API_KEY=
ELECTRICITYMAP_API_KEY=
MAGIC_SECRET_KEY=          # For Magic auth (sk_live_...)
JWT_SECRET=                # openssl rand -hex 32
DEFAULT_PUE=1.3
DEFAULT_CARBON_INTENSITY=0.4
CORS_ORIGINS=              # Comma-separated frontend origins
```

See `docs/VERCEL_DEPLOYMENT.md` and `docs/RAILWAY_DEPLOYMENT.md` for production deployment.

---

## Monte Carlo Modeling

AICo2 includes probabilistic modeling to account for uncertainty in:

- Token usage
- Hardware energy intensity
- Carbon intensity

The system produces:

- Mean estimate
- Median estimate
- P10
- P90
- Distribution samples

This enables confidence interval reporting rather than single-point claims.

---

## Methodological Limitations

AICo2 does not claim:

- Direct measurement of provider hardware telemetry
- Embodied carbon accounting
- Market-based renewable attribution without documentation
- Exact per-request ground-truth emissions

All results are model-based estimates with documented assumptions.

---

## Roadmap

- Region-specific carbon intensity modeling
- Sensitivity analysis (tornado diagrams)
- ESG-ready reporting exports
- Multi-tenant enterprise governance
- Cryptographically signed emission logs
- Open benchmarking alignment with MLPerf Power

---

## Contributing

AICo2 is research-driven and open to collaboration.

If you are working on:

- Green software standards
- AI energy benchmarking
- Carbon accounting frameworks
- Grid-intensity APIs
- Climate policy

We welcome issues and pull requests.

---

## Related Work

**Mālama Labs**  
Digital MRV systems for climate-aligned infrastructure.

**AI Carbon Outlook 2026**  
Scenario-based modeling of AI inference emissions.

---

## License

MIT License

---

## Disclaimer

AICo2 provides modeled carbon estimates based on transparent assumptions and publicly available efficiency benchmarks. It is not a certified emissions auditing system. Organizations should validate assumptions against their operational context.
