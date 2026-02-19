# CO2AI

**Carbon Accounting & Governance for AI Inference**

AI is scaling rapidly. Its operational carbon footprint is largely invisible.

CO2AI is an open, research-driven framework for estimating, tracking, and governing the energy use and associated CO₂ emissions of large language model (LLM) inference workloads.

Developed by Mālama Labs, CO2AI applies digital MRV (Measurement, Reporting, and Verification) principles to AI infrastructure.

---

## Why CO2AI?

As AI inference becomes embedded in applications, workflows, and infrastructure:

- Engineering teams track tokens and cost.
- Sustainability teams track electricity procurement.
- Few organizations track inference emissions per request.

CO2AI bridges that gap by attaching carbon intelligence directly to AI operations.

---

## What It Does

CO2AI provides:

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
CO2AI Proxy (OpenAI-compatible)
        ↓
Upstream LLM Provider
```

At each inference call, CO2AI:

1. Estimates FLOPs based on token usage.
2. Converts compute to energy using hardware efficiency assumptions.
3. Applies data center overhead (PUE).
4. Applies grid carbon intensity (location-based or marginal).
5. Logs results.
6. Optionally enforces carbon budgets.
7. Optionally routes to lower-carbon regions.

---

## Research Basis

CO2AI builds on established work in machine learning energy reporting and software carbon accounting:

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

CO2AI can evaluate:

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

## Installation

### Backend

```bash
git clone https://github.com/tylermalin/CO2AI.git
cd CO2AI/backend
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
DEFAULT_PUE=1.3
DEFAULT_CARBON_INTENSITY=0.4
```

---

## Monte Carlo Modeling

CO2AI includes probabilistic modeling to account for uncertainty in:

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

CO2AI does not claim:

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

CO2AI is research-driven and open to collaboration.

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

CO2AI provides modeled carbon estimates based on transparent assumptions and publicly available efficiency benchmarks. It is not a certified emissions auditing system. Organizations should validate assumptions against their operational context.
