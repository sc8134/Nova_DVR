# Nova DVR — Deployment Guide

> Backend → **Render** (free tier)  
> Frontend → **Vercel** (free tier)

---

## Step 1 — Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign in (use your GitHub account).

2. Click **New → Web Service**.

3. Connect your GitHub repo: `sc8134/Nova_DVR`.

4. Configure the service:

   | Field | Value |
   |---|---|
   | **Name** | `nova-dvr-backend` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Python 3` |
   | **Build Command** | `apt-get update -y && apt-get install -y ffmpeg && pip install -r requirements.txt` |
   | **Start Command** | `gunicorn app:app --bind 0.0.0.0:$PORT --timeout 300 --workers 2 --threads 4 --worker-class gthread` |
   | **Plan** | Free |

5. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `FLASK_ENV` | `production` |
   | `ALLOWED_ORIGIN` | *(leave blank for now — fill in after Vercel deploy)* |

6. Click **Create Web Service**.  
   Render will build and deploy. Wait for the status to show **Live**.

7. Copy your backend URL — it will look like:  
   `https://nova-dvr-backend.onrender.com`

---

## Step 2 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.

2. Click **Add New → Project**.

3. Import your `sc8134/Nova_DVR` repo.

4. Configure:

   | Field | Value |
   |---|---|
   | **Root Directory** | `frontend` |
   | **Framework Preset** | Next.js (auto-detected) |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `.next` |

5. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_BACKEND_URL` | `https://nova-dvr-backend.onrender.com` *(your Render URL from Step 1)* |

6. Click **Deploy**.  
   Vercel will build and give you a URL like:  
   `https://nova-dvr.vercel.app`

---

## Step 3 — Wire CORS back to Render

1. Go to your Render service → **Environment**.

2. Set `ALLOWED_ORIGIN` to your Vercel URL:
   ```
   https://nova-dvr.vercel.app
   ```

3. Click **Save Changes** — Render will redeploy automatically.

---

## Step 4 — Verify

Open your Vercel URL and check:

- ✅ Splash screen appears
- ✅ Backend status dot in sidebar is green (polls `/health`)
- ✅ Paste a YouTube URL → Inspect works
- ✅ Download a file → SSE progress streams correctly

---

## Notes

### Free tier cold starts
Render's free tier spins down after **15 minutes of inactivity**.  
The first request after idle takes ~30–60 seconds.  
Your app's `/health` polling (`useBackendStatus`) already shows a connecting state during this time.

### SQLite on Render
`jobs.db` lives on Render's ephemeral disk — it resets on every redeploy.  
Job history will still appear in the frontend via `localStorage`.  
To persist across redeploys, upgrade to Render's paid tier + a persistent disk, or swap SQLite for a free PostgreSQL instance (Render provides one).

### Custom domain
- Vercel: Project → Settings → Domains → Add domain
- Render: Service → Settings → Custom Domains

### Redeploys
Both Render and Vercel auto-deploy on every push to `main`.  
`render.yaml` and `vercel.json` are already configured in the repo.
