# Railway Backend Deployment

Deploy the AICo2 FastAPI backend to Railway with PostgreSQL.

## 1. Create a Railway Project

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project**.
3. Choose **Deploy from GitHub repo** and select `tylermalin/CO2AI` (or your fork).

## 2. Add PostgreSQL

1. In your project, click **+ New**.
2. Select **Database** → **PostgreSQL**.
3. Railway provisions a Postgres instance and exposes `DATABASE_URL`.

## 3. Configure the Backend Service

1. Click **+ New** → **GitHub Repo** (or add a service from the same repo).
2. Select your repo.
3. In the service **Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: (leave empty – Railway uses the Dockerfile)
   - **Start Command**: (leave empty – Dockerfile CMD is used)
   - **Watch Paths**: `backend/**` (optional, for faster deploys)

Railway will detect the `backend/Dockerfile` and build from it.

## 4. Set Environment Variables

In the backend service, go to **Variables** and add:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Postgres connection string | *(Auto-set if you link the Postgres service)* |
| `JWT_SECRET` | Secret for JWT signing | `your-random-secret-min-32-chars` |
| `MAGIC_SECRET_KEY` | Magic auth secret (from [dashboard.magic.link](https://dashboard.magic.link)) | `sk_live_xxxxx` |
| `OPENAI_API_KEY` | OpenAI API key (for proxy/demo) | `sk-xxxxx` |
| `ELECTRICITYMAP_API_KEY` | *(Optional)* Carbon intensity API | `xxxxx` |
| `CORS_ORIGINS` | *(Optional)* Comma-separated frontend origins. Default `*` allows all. For production, set e.g. `https://your-app.vercel.app` | `https://aic02.vercel.app` |

### Link Postgres to the backend

The app automatically converts `postgres://` or `postgresql://` to `postgresql+asyncpg://` for SQLAlchemy, so Railway's default URL works without changes.

**Steps:**

1. Open the backend service.
2. Go to **Variables**.
3. **Delete** any existing `DATABASE_URL` that points to localhost.
4. Click **+ New Variable** → **Add Reference**.
5. Select your **Postgres** service (the database, not the backend).
6. Choose `DATABASE_URL` or `DATABASE_PUBLIC_URL`.
7. Save and redeploy.

**If you see "Could not parse SQLAlchemy URL":** The reference may not be resolved. Ensure you selected the Postgres *database* service (not the backend) when adding the reference. The variable value should be a real URL like `postgresql://postgres:xxx@host.railway.app:5432/railway`, not `${{...}}`.

---

## 5. Generate JWT_SECRET

```bash
openssl rand -hex 32
```

Use the output as `JWT_SECRET`.

## 6. Deploy

1. Railway builds and deploys on every push to the connected branch.
2. After deploy, open **Settings** → **Networking** → **Generate Domain** to get a public URL (e.g. `https://your-backend.up.railway.app`).

## 7. Verify

- Health: `https://your-backend.up.railway.app/api/v1/health`
- Docs: `https://your-backend.up.railway.app/docs`

## 8. Connect the Frontend

In your Vercel (or other) frontend project, set:

```
VITE_API_URL=https://your-backend.up.railway.app/api/v1
```

---

## Optional: `railway.json` (Nixpacks)

If you prefer Nixpacks instead of Docker:

Create `backend/railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Railway sets `PORT` automatically. With the Dockerfile, you don’t need this; the Dockerfile already uses port 8000, and Railway maps it.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| DB connection refused | Ensure `DATABASE_URL` is linked from the Postgres service. The app auto-converts the URL format. |
| Tables not found | `init_db()` runs on startup and creates tables. Check logs for DB errors. |
| Magic auth 404 | Set `MAGIC_SECRET_KEY` and ensure the frontend uses the matching `VITE_MAGIC_PUBLISHABLE_KEY`. |
| CORS errors | Set `CORS_ORIGINS` to your frontend URL (e.g. `https://your-app.vercel.app`). Default `*` allows all origins. |
