—→→→→⚠️→—# Deploy backend to Render — step-by-step

Use this while you click through [Render](https://render.com). Your repo is already on GitHub: **https://github.com/TimLEADS/estateland**

---

## 1. Open Render and sign in

- Go to **https://render.com**
- Sign up or log in (use **Sign in with GitHub** so Render can see your repos).

---

## 2. Create a new Web Service

- Click **New +** (top right) → **Web Service**.
- If asked to connect GitHub, connect your account and authorize **TimLEADS/estateland** (or your org).

---

## 3. Connect the repository

- In **Connect a repository**, find and select **estateland** (owner: TimLEADS).
- Click **Connect** (or **Use this repository**).

---

## 4. Configure the service

Fill in exactly:

| Field | Value |
|-------|--------|
| **Name** | `estateland-api` (or any name; this becomes part of the URL) |
| **Region** | Choose one (e.g. Oregon (US West) or Frankfurt) |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | **Node** |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

---

## 5. Add environment variable

- Scroll to **Environment Variables** → **Add Environment Variable**.
- Add:

| Key | Value |
|-----|--------|
| **STRIPE_SECRET_KEY** | Your Stripe secret key (starts with `sk_live_` or `sk_test_`) |

To get the key: [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → **API keys** → copy **Secret key**.  
Use **Test** key (`sk_test_...`) first; switch to **Live** (`sk_live_...`) when you’re ready for real payments.

- (Optional) Add **NODE_ENV** = `production`.

---

## 6. Deploy

- Click **Create Web Service**.
- Render will clone the repo, run `npm install` in the `server` folder, then `npm start`. Wait until the status is **Live** (green).

---

## 7. Copy your backend URL

- At the top of the service page you’ll see the URL, e.g.  
  **https://estateland-api.onrender.com**  
  (or **https://estateland-api-xxxx.onrender.com**)
- Copy this URL (no trailing slash). You’ll use it as **VITE_API_URL** when deploying the frontend to Vercel.

---

## 8. Test the API

- Open in a browser: **https://YOUR-SERVICE-NAME.onrender.com/api/health**
- You should see: `{"ok":true,"stripe":true}` (or `"stripe":false` if the key wasn’t set correctly).

---

**Next:** In Vercel, set **VITE_API_URL** = this URL (e.g. `https://estateland-api.onrender.com`) and redeploy the frontend so payments work on the live site.
