# Vercel Deployment Instructions

Deploy the AICo2 frontend to Vercel. The backend (FastAPI + Postgres) must be hosted separately (e.g. Railway, Render, Fly.io).

## 1. Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New** → **Project**.
3. Import your repository: `tylermalin/CO2AI` (or your fork).
4. Vercel will auto-detect the project.

## 2. Configure Build Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

Or use these in the Vercel dashboard under **Settings → General**.

## 3. Environment Variables

Add these in **Settings → Environment Variables** (for Production, Preview, and Development as needed):

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL (e.g. `https://your-api.railway.app/api/v1`) | Yes, if backend is deployed |
| `VITE_MAGIC_PUBLISHABLE_KEY` | Magic auth publishable key from [dashboard.magic.link](https://dashboard.magic.link) | Yes, for sign-in |

**Example:**
```
VITE_API_URL=https://aic02-api.up.railway.app/api/v1
VITE_MAGIC_PUBLISHABLE_KEY=pk_live_xxxxx
```

> **Note:** The frontend reads `.env` from the project root during local dev. On Vercel, only variables prefixed with `VITE_` are exposed to the client build.

## 4. SPA Routing (React Router)

Add a `vercel.json` in the **project root** (or in `frontend/`) so client-side routes work:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

If Root Directory is `frontend`, put `vercel.json` in `frontend/` and the rewrite will apply to the built output.

## 5. Deploy

1. Click **Deploy**.
2. Vercel will build and deploy. The first deploy may take a few minutes.
3. Your site will be available at `https://your-project.vercel.app`.

## 6. Custom Domain (Optional)

1. Go to **Settings → Domains**.
2. Add your domain (e.g. `aic02.com`).
3. Follow the DNS instructions to add the provided records.

---

## Optional: `vercel.json` in the Repo

Create `frontend/vercel.json` in your repo so Vercel auto-configures:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

With **Root Directory** set to `frontend`, Vercel will use this config.

---

## Backend Deployment

The backend must be deployed elsewhere. Options:

- **Railway** – Easy Postgres + FastAPI setup
- **Render** – Free tier with Postgres
- **Fly.io** – For multi-region deployment

Set `VITE_API_URL` to your deployed backend URL (e.g. `https://your-app.onrender.com/api/v1`).
