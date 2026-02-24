# Estate Land — Full process to take the site live

Step-by-step guide to deploy your Estate Land site so it’s live on the internet (with optional custom domain and Stripe payments).

---

## What you’re deploying

- **Frontend**: Vite + React app (marketing site, onboarding, dashboard login).
- **Backend**: Node/Express API (Stripe checkout). It must be online for payments to work.
- **Optional**: Custom domain (e.g. **estateland.us**).

---

## Prerequisites

1. **Node.js** (v18 or newer) — [nodejs.org](https://nodejs.org)
2. **Git** — [git-scm.com](https://git-scm.com)
3. **Accounts** (all free):
   - [GitHub](https://github.com)
   - [Vercel](https://vercel.com) (frontend)
   - [Render](https://render.com) (backend API)
   - [Stripe](https://stripe.com) (payments; you may already have this)

---

# Part 1 — Prepare the project locally

## Step 1.1: Put the project under Git (if not already)

Open a terminal in your project folder and run:

```bash
cd "c:\Users\PONYEl POP\Downloads\New folder (2)"
git init
git add .
git commit -m "Initial commit - Estate Land site"
```

## Step 1.2: Create a GitHub repository and push

1. On GitHub, click **New repository**.
2. Name it (e.g. `estateland`), leave it empty (no README).
3. In your project folder, run (replace `YOUR_USERNAME` and `estateland` with your repo name):

```bash
git remote add origin https://github.com/YOUR_USERNAME/estateland.git
git branch -M main
git push -u origin main
```

## Step 1.3: Test the build locally

```bash
npm install
npm run build
```

If this finishes without errors, the frontend is ready to deploy. You can also run `npm run preview` to open the built site locally.

---

# Part 2 — Deploy the backend (API for Stripe)

Your site calls `/api/create-checkout-session` and `/api/checkout-session/:id`. In production these must point to a live server. Render’s free tier is enough to start.

## Step 2.1: Prepare the backend for Render

1. In the **server** folder, create a file **server/.env** (do not commit this file; keep it only on your machine for now):

   - Copy **server/.env.example** if it exists, or create **server/.env** with:

   ```
   STRIPE_SECRET_KEY=sk_live_xxxx
   PORT=3001
   ```

   Replace `sk_live_xxxx` with your real Stripe secret key (Dashboard → Developers → API keys). Use test key `sk_test_...` first if you prefer.

2. Ensure **server/package.json** exists and has a start script. If your backend is only **server/index.js** and uses top-level `import`, Render needs to run it with Node. Check that **package.json** in the project root has the server script; we’ll tell Render which command to run in Step 2.3.

## Step 2.2: Create a new Web Service on Render

1. Go to [render.com](https://render.com) and sign up / log in.
2. **New +** → **Web Service**.
3. Connect your **GitHub** account and select the **estateland** (or your repo) repository.
4. Configure:
   - **Name**: e.g. `estateland-api`
   - **Region**: choose closest to you or your users.
   - **Branch**: `main`
   - **Root Directory**: `server`  
     (So Render uses only the **server** folder, which has its own **package.json**.)
   - **Runtime**: **Node**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`  
     (This runs `node index.js` as defined in **server/package.json**.)
   - **Instance Type**: **Free**

5. **Environment** (Environment Variables):
   - `STRIPE_SECRET_KEY` = your Stripe secret key (e.g. `sk_live_...` or `sk_test_...`).
   - `NODE_ENV` = `production` (optional but recommended).

6. Click **Create Web Service**. Wait until the service is **Live** and note the URL, e.g.:

   `https://estateland-api.onrender.com`

7. Test the API:
   - Open: `https://estateland-api.onrender.com/api/health`  
   You should see something like `{"ok":true,"stripe":true}`.

This URL is your **backend base URL**. The frontend will call this in production.

---

# Part 3 — Deploy the frontend (Vercel)

## Step 3.1: Connect repo to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. **Add New** → **Project**.
3. Import your **GitHub** repository (e.g. `estateland`).
4. **Configure Project**:
   - **Framework Preset**: Vite (Vercel usually detects it).
   - **Root Directory**: leave blank.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist` (default for Vite)
   - **Install Command**: `npm install`

## Step 3.2: Set environment variable for the API

In the same screen (or later in **Project → Settings → Environment Variables**):

- **Name**: `VITE_API_URL`
- **Value**: your backend URL from Part 2, e.g. `https://estateland-api.onrender.com` (no trailing slash)
- **Environment**: Production (and Preview if you want)

Then click **Deploy**. Wait until the deployment finishes.

## Step 3.3: Open the live site

Vercel will show a URL like:

`https://estateland-xxxx.vercel.app`

Open it. The site should load. Test:

- Navigation, contact form, “Start now” (dashboard login).
- **Get started** → choose a plan → **Pay**. It should redirect to Stripe Checkout and use your live backend.

---

# Part 4 — Custom domain (e.g. estateland.us)

## Step 4.1: Add domain in Vercel

1. In Vercel: **Project** → **Settings** → **Domains**.
2. Add your domain, e.g. `estateland.us` (and optionally `www.estateland.us`).
3. Vercel will show **DNS instructions** (what to set at your domain registrar).

## Step 4.2: Configure DNS at your registrar

Where you bought **estateland.us** (GoDaddy, Namecheap, Cloudflare, etc.):

- For **apex** (estateland.us):
  - Add an **A** record:  
    Name `@`, Value `76.76.21.21` (Vercel’s IP), or use the exact value Vercel shows.
- For **www** (www.estateland.us):
  - Add a **CNAME** record:  
    Name `www`, Value `cname.vercel-dns.com` (or the value Vercel gives).

Save, then in Vercel click **Verify**. DNS can take a few minutes up to 48 hours.

## Step 4.3: HTTPS

Vercel will issue an SSL certificate automatically. After the domain is verified, the site will be available at `https://estateland.us`.

---

# Part 5 — Optional: Backend on same domain (advanced)

If you want `/api/*` on the same domain as the frontend (e.g. `https://estateland.us/api/...`):

- Use **Vercel Rewrites** to proxy `/api` to your Render backend URL, or
- Move the API to **Vercel Serverless Functions** (would require refactoring **server/index.js** into serverless handlers).

For most cases, using a separate backend URL and `VITE_API_URL` (as in Part 3) is enough.

---

# Checklist before going live

- [ ] `npm run build` succeeds locally.
- [ ] Backend deployed on Render and **/api/health** returns `{"ok":true}`.
- [ ] `VITE_API_URL` set in Vercel to the Render backend URL (no trailing slash).
- [ ] Frontend deployed on Vercel and loads correctly.
- [ ] Test “Get started” → plan → Pay: redirects to Stripe and returns to your site.
- [ ] Stripe Dashboard: use **Live** keys when you’re ready for real payments; **Test** keys for testing.
- [ ] Custom domain (if used): DNS set and verified; HTTPS works.

---

# Quick reference

| Item              | Example / command |
|-------------------|-------------------|
| Backend URL      | `https://estateland-api.onrender.com` |
| Frontend env     | `VITE_API_URL=https://estateland-api.onrender.com` |
| Local build      | `npm run build` |
| Local preview     | `npm run preview` |
| Local dev (API)  | `npm run server` (in one terminal) then `npm run dev` (in another) |

If you tell me which step you’re on (e.g. “I’m at Step 2.2” or “I use Netlify instead of Vercel”), I can give exact clicks or commands for that part.
