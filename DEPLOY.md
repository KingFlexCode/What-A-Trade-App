# WhatATrade! — Deployment Guide

> Get WhatATrade! live in about 30 minutes. All free.

## Stack
- **Frontend** → Netlify (free)
- **Backend**  → Render (free tier)
- **Database** → Supabase (free tier — real PostgreSQL)

---

## Step 1 — Set up Supabase (database) ~5 min

1. Go to **https://supabase.com** → Sign up free
2. Click **New project**
   - Name: `whatatrade`
   - Database password: save this somewhere safe
   - Region: pick the closest to you
3. Wait ~2 minutes for it to provision
4. Click **SQL Editor** in the left sidebar
5. Paste the entire contents of `backend/database/schema.sql`
6. Click **Run** — all your tables are created

7. Go to **Settings → API** and copy:
   - Project URL → this is your `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role secret` key → `SUPABASE_SERVICE_KEY`

---

## Step 2 — Deploy backend to Render ~10 min

1. Go to **https://render.com** → Sign up free (use GitHub login)
2. Click **New → Web Service**
3. Connect your GitHub repo: `KingFlexCode/WhatATrade`
4. Configure:
   - **Name**: `whatatrade-backend`
   - **Root directory**: `backend`
   - **Build command**: `npm install`
   - **Start command**: `npm start`
   - **Instance type**: Free
5. Click **Advanced → Add Environment Variables** and add:

```
NODE_ENV          = production
FRONTEND_URL      = https://whatatrade.netlify.app
JWT_SECRET        = (paste a long random string — generate at passwordsgenerator.net)
SUPABASE_URL      = (from Step 1)
SUPABASE_ANON_KEY = (from Step 1)
SUPABASE_SERVICE_KEY = (from Step 1)
```

6. Click **Create Web Service**
7. Wait ~3 minutes for first deploy
8. Copy your Render URL — looks like: `https://whatatrade-backend.onrender.com`

---

## Step 3 — Deploy frontend to Netlify ~5 min

1. Go to **https://netlify.com** → Sign up free (use GitHub login)
2. Click **Add new site → Import an existing project**
3. Connect GitHub → select `KingFlexCode/WhatATrade`
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Click **Show advanced → New variable** and add:

```
VITE_API_URL = https://whatatrade-backend.onrender.com
```

6. Click **Deploy site**
7. Wait ~2 minutes
8. Your site is live! Netlify gives you a URL like `random-name.netlify.app`

### Give it a custom name:
- Site settings → General → Site name → change to `whatatrade`
- Your URL becomes: `https://whatatrade.netlify.app`

---

## Step 4 — Update backend CORS ~1 min

Now that you have your Netlify URL, update the environment variable on Render:

1. Go to Render → your backend service → Environment
2. Update `FRONTEND_URL` to your actual Netlify URL:
   ```
   FRONTEND_URL = https://whatatrade.netlify.app
   ```
3. Render auto-redeploys

---

## Step 5 — Test it

Open `https://whatatrade.netlify.app`

- Sign up with an email
- Log a trade
- Check Supabase → Table Editor → trades — your trade should be there!

---

## Verify everything is working

```bash
# Check backend health
curl https://whatatrade-backend.onrender.com/health
```

Should return:
```json
{
  "status": "ok",
  "app": "WhatATrade!",
  "database": "connected"
}
```

---

## Pushing updates

Every time you push to GitHub, Netlify and Render auto-deploy:

```bash
git add .
git commit -m "your update message"
git push
```

That's it — both frontend and backend update automatically.

---

## Troubleshooting

**"Application error" on Render**
- Check Render logs → Dashboard → your service → Logs
- Usually a missing environment variable

**Trades not saving**
- Check that `SUPABASE_SERVICE_KEY` is set (not the anon key)
- Run the schema.sql again in Supabase SQL editor

**CORS error in browser**
- Make sure `FRONTEND_URL` on Render matches your exact Netlify URL
- Include `https://` and no trailing slash

**Render goes to sleep**
- Free tier sleeps after 15 min of inactivity, takes ~30s to wake
- Upgrade to Render Starter ($7/mo) to keep it always on
