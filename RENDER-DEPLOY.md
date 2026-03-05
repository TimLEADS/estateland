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

To get the key: [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → **API keys** → copy **Secret key**. Use **Test** key (`sk_test_...`) first; switch to **Live** (`sk_live_...`) when you're ready for real payments.

- (Optional) Add **NODE_ENV** = `production`.

---

## 6. Deploy

- Click **Create Web Service**.
- Render will clone the repo, run `npm install` in the `server` folder, then `npm start`. Wait until the status is **Live** (green).

---

## 7. Copy your backend URL

- At the top of the service page you'll see the URL, e.g. **https://estateland-api.onrender.com** (or **https://estateland-api-xxxx.onrender.com**)
- Copy this URL (no trailing slash). You'll use it as **VITE_API_URL** when deploying the frontend to Vercel.

---

## 8. Test the API

- Open in a browser: **https://YOUR-SERVICE-NAME.onrender.com/api/health**
- You should see: `{"ok":true,"stripe":true}` (or `"stripe":false` if the key wasn't set correctly).

---

**Next:** In Vercel, set **VITE_API_URL** = this URL (e.g. `https://estateland-api.onrender.com`) and redeploy the frontend so payments work on the live site.

---

## 9. Google Sheets Live Sync (Free — Auto-updates on every save)

The dashboard auto-syncs every relator and payment to two Google Sheets. Setup takes ~10 minutes and is completely free.

### 9a. Create a Google Cloud Project & enable the Sheets API

1. Go to **https://console.cloud.google.com**
2. Click the project dropdown (top left) → **New Project** → give it any name (e.g. `estateland`) → **Create**.
3. In the search bar type **Google Sheets API** → click it → **Enable**.

### 9b. Create a Service Account (the bot that writes to your sheets)

1. In the left menu go to **IAM & Admin** → **Service Accounts**.
2. Click **+ Create Service Account**.
   - Name: `estateland-sheets` (or anything)
   - Click **Create and Continue** → **Done** (skip optional steps).
3. Click on the service account you just created → **Keys** tab → **Add Key** → **Create new key** → **JSON** → **Create**.
4. A JSON file downloads to your computer. **Keep this file safe** — it's your credentials.
5. Open the JSON file in a text editor, select all, copy it. **Minify it** (remove newlines) — easiest way: paste into https://jsonformatter.org/json-minify → copy the output.

### 9c. Create the two Google Sheets

1. Go to **https://sheets.google.com** → **Blank spreadsheet**.
2. Rename the file to **Estate Land — Payments**.
3. At the bottom, right-click the default tab → **Rename** → type exactly: `Payments`
4. Share the sheet: click **Share** (top right) → paste the service account email (looks like `estateland-sheets@YOUR-PROJECT.iam.gserviceaccount.com`) → set role to **Editor** → **Send**.
5. Copy the spreadsheet ID from the URL bar: `https://docs.google.com/spreadsheets/d/**THIS-PART**/edit`

6. Create a second sheet → rename file to **Estate Land — All Relators**.
7. Rename the tab to exactly: `All Relators`
8. Share it with the same service account email as Editor.
9. Copy this spreadsheet's ID too.

### 9d. Add environment variables to Render

In your Render service → **Environment** → add these 3 variables:

| Key | Value |
|-----|--------|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | The full minified JSON from step 9b (single line, no spaces) |
| `GOOGLE_SHEETS_PAYMENTS_ID` | The spreadsheet ID from the Payments sheet URL |
| `GOOGLE_SHEETS_RELATORS_ID` | The spreadsheet ID from the All Relators sheet URL |

Click **Save Changes** — Render will redeploy automatically.

### 9e. Verify it's working

1. Open **https://YOUR-SERVICE.onrender.com/api/health** — you should see `"sheets":true`.
2. Add or edit a relator in the dashboard → check the **All Relators** sheet — a row should appear with gold headers.
3. A payment recorded → check the **Payments** sheet — it should appear with amount, email, plan, date.

> **The sheets are read-only backups** — changes made directly in Google Sheets are NOT synced back to the dashboard. The dashboard is the source of truth; the sheets are a live mirror.
