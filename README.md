# AIC02 — AI Carbon Control Plane

Phase 1 backend scaffold. FastAPI + Postgres + Docker.

## Prerequisites: Docker

### Ubuntu / Debian

```bash
# Add Docker's official GPG key
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### macOS

**Option A — Docker Desktop (recommended)**

1. Download from [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
2. Open the `.dmg`, drag Docker to Applications
3. Launch Docker Desktop and wait for it to finish starting
4. Verify: `docker --version` and `docker compose version`

**Option B — Homebrew**

```bash
brew install --cask docker
```

Then launch Docker Desktop from Applications and wait for it to start.

## Setup

1. Copy `.env.example` to `.env` and adjust.
2. Run with Docker Compose:

```bash
docker compose up --build
```

Backend: http://localhost:8000  
Health: http://localhost:8000/api/v1/health

## Proxy (Phase 3)

OpenAI-compatible `/v1/chat/completions` proxy with carbon estimate. Rebuild after code changes: `docker compose up --build`. Set `OPENAI_API_KEY` in `.env`, then:

```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Say hi"}]}'
```

Response includes `carbon_estimate_kg_co2eq`.

## Emissions Ledger (Phase 4)

Proxy requests are persisted to `emission_records` with optional `X-Organization-Id` header for multi-tenant scoping. Tables are created on startup via `init_db()`.

**Dev migration:** Run `python scripts/init_db.py` from project root to create tables without starting the app.

**Aggregation API** (optional `X-Organization-Id` header):

```bash
# Monthly total
curl http://localhost:8000/api/v1/emissions/monthly

# Daily totals (last 30 days)
curl http://localhost:8000/api/v1/emissions/daily?days=30

# Last 100 requests
curl http://localhost:8000/api/v1/emissions/recent?limit=100
```

**Tests:** `docker compose run --rm -e OPENAI_API_KEY= backend python -m pytest tests/ -v`

## Carbon Budgets (Phase 5)

Org-level monthly carbon limits with alert threshold and optional hard block. Proxy checks projected total before committing; rejects with 402 if exceeded (when `hard_block`), or attaches `carbon_budget_warning` when alert threshold crossed.

**Create budget** (creates org if needed):

```bash
ORG_ID=$(uuidgen)
curl -X POST http://localhost:8000/api/v1/carbon-budgets \
  -H "Content-Type: application/json" \
  -H "X-Organization-Id: $ORG_ID" \
  -d '{"monthly_limit_kg_co2eq": 0.0001, "alert_threshold_pct": 80, "enforcement_enabled": true, "hard_block": false}'
```

**Manual test enforcement:**

1. Create budget with a tiny limit (e.g. `0.00001`) and `hard_block: true`
2. Call proxy with `X-Organization-Id: $ORG_ID` — should get 402 after first request
3. Create budget with `hard_block: false` and `alert_threshold_pct: 1` — requests succeed but response includes `carbon_budget_warning`
4. Omit `X-Organization-Id` — no budget check, requests always allowed

## Real-Time Carbon API (Phase 6)

Electricity Maps integration for region-specific carbon intensity. In-memory 5-minute cache, fallback to default when API unavailable.

**Setup:** Set `ELECTRICITYMAP_API_KEY` in `.env`. Optional `ELECTRICITYMAP_DEFAULT_ZONE` (default: US-CAL-CISO).

**Region header:** Pass `X-Region` with Electricity Maps zone (e.g. `US-CAL-CISO`, `US-NY-NYIS`):

```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "X-Region: US-CAL-CISO" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hi"}]}'
```

Without `X-Region`, uses default zone from config.

## Carbon-Aware Routing (Phase 7)

Routing engine selects upstream region by mode before forwarding. Estimates emissions per region (from Electricity Maps), picks lowest-carbon in optimize mode.

**Modes** (header `X-Routing-Mode`):
- `standard` — use `X-Region` or first configured region
- `optimize` — estimate carbon per region, forward to lowest
- `latency_priority` — use first region immediately (no carbon lookup during routing)

**Multi-region config** (env `UPSTREAM_REGIONS`, JSON):

```bash
UPSTREAM_REGIONS='[{"zone":"US-CAL-CISO","base_url":"https://api.openai.com/v1"},{"zone":"FR","base_url":"https://api.openai.com/v1"}]'
```

**Response metadata:** `routing.region`, `routing.mode`, `routing.reason`, `routing.region_estimates` (optimize mode). Routing decision is logged to `emission_records`.
