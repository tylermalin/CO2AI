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
