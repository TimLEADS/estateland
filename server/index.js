import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import cors from "cors";
import Stripe from "stripe";
import Database from "better-sqlite3";
import { appendPayment, upsertRelator, removeRelator, upsertOnboarding } from "./sheets.js";

// -- SQLite setup --
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "estateland.db");
const dataDir = path.dirname(DB_PATH);
import { mkdirSync, existsSync } from "fs";
try { mkdirSync(dataDir, { recursive: true }); } catch (_) {}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
          name TEXT DEFAULT '',
              email TEXT DEFAULT '',
                  phone TEXT DEFAULT '',
                      brokerage TEXT DEFAULT '',
                          planId TEXT DEFAULT '',
                              region TEXT DEFAULT '',
                                  zips TEXT DEFAULT '',
                                      state TEXT DEFAULT '',
                                          county TEXT DEFAULT '',
                                              primaryArea TEXT DEFAULT '',
                                                  primarySMR TEXT DEFAULT '',
                                                      secondaryArea TEXT DEFAULT '',
                                                          secondarySMR TEXT DEFAULT '',
                                                              signupDate TEXT DEFAULT '',
                                                                  documentSignDate TEXT DEFAULT '',
                                                                      lastLeadSent TEXT DEFAULT '',
                                                                          leadSentCount INTEGER DEFAULT 0,
                                                                              ha TEXT DEFAULT '',
                                                                                  remarks TEXT DEFAULT '',
                                                                                      leadType TEXT DEFAULT '',
                                                                                          note TEXT DEFAULT '',
                                                                                              createdAt TEXT DEFAULT '',
                                                                                                  password TEXT DEFAULT ''
                                                                                                    );
                                                                                                    
                                                                                                      CREATE TABLE IF NOT EXISTS leads (
                                                                                                          id TEXT PRIMARY KEY,
                                                                                                              address TEXT DEFAULT '',
                                                                                                                  notes TEXT DEFAULT '',
                                                                                                                      assignedToUserId TEXT DEFAULT '',
                                                                                                                          status TEXT DEFAULT 'new',
                                                                                                                              createdAt TEXT DEFAULT ''
                                                                                                                                );
                                                                                                                                
                                                                                                                                  CREATE TABLE IF NOT EXISTS onboarding_sessions (
                                                                                                                                      id TEXT PRIMARY KEY,
                                                                                                                                          step INTEGER DEFAULT 1,
                                                                                                                                              plan TEXT DEFAULT '{}',
                                                                                                                                                  territory TEXT DEFAULT '{}',
                                                                                                                                                      contact TEXT DEFAULT '{}',
                                                                                                                                                          startedAt TEXT DEFAULT '',
                                                                                                                                                              lastActivityAt TEXT DEFAULT '',
                                                                                                                                                                  submittedAt TEXT DEFAULT '',
                                                                                                                                                                      status TEXT DEFAULT 'in_progress'
                                                                                                                                                                        );
                                                                                                                                                                        
                                                                                                                                                                          CREATE TABLE IF NOT EXISTS payments (
                                                                                                                                                                              id TEXT PRIMARY KEY,
                                                                                                                                                                                  amountTotal INTEGER DEFAULT 0,
                                                                                                                                                                                      currency TEXT DEFAULT 'usd',
                                                                                                                                                                                          customerEmail TEXT DEFAULT '',
                                                                                                                                                                                              planId TEXT DEFAULT '',
                                                                                                                                                                                                  stripeSessionId TEXT DEFAULT '',
                                                                                                                                                                                                      paidAt TEXT DEFAULT ''
                                                                                                                                                                                                        );
                                                                                                                                                                                                        
                                                                                                                                                                                                          CREATE TABLE IF NOT EXISTS chat_sessions (
                                                                                                                                                                                                              id TEXT PRIMARY KEY,
                                                                                                                                                                                                                  startedAt TEXT DEFAULT '',
                                                                                                                                                                                                                      page TEXT DEFAULT '',
                                                                                                                                                                                                                          source TEXT DEFAULT 'website',
                                                                                                                                                                                                                              messages TEXT DEFAULT '[]'
                                                                                                                                                                                                                                );
                                                                                                                                                                                                                                `);

// Migrate: add password column if missing
try {
    db.prepare("ALTER TABLE users ADD COLUMN password TEXT DEFAULT ''").run();
    console.log("Migrated: added password column to users table.");
} catch (_) {}

console.log("SQLite database ready at", DB_PATH);

// -- Google Sheets env check --
const SHEETS_READY = !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY &&
    process.env.GOOGLE_SHEETS_PAYMENTS_ID &&
    process.env.GOOGLE_SHEETS_RELATORS_ID
  );
if (!SHEETS_READY) {
    console.warn("Google Sheets env vars not set -- sheets sync disabled.");
}

// -- Stripe setup --
const secretKey = (process.env.STRIPE_SECRET_KEY || "").trim();
if (!secretKey || !secretKey.startsWith("sk_")) {
    console.error("Missing or invalid STRIPE_SECRET_KEY.");
}
const stripe = secretKey ? new Stripe(secretKey) : null;

const app = express();

// Raw body parser MUST come before json() for the webhook route
app.use("/api/stripe-webhook", express.raw({ type: "application/json" }));
app.use(cors({ origin: true }));
app.use(express.json());

const PLAN_PRICES = { launch: 32900, growth: 54900, premier: 105000 };
const PLAN_NAMES  = { launch: "Launch - 6 months", growth: "Growth - per year", premier: "Premier - lifetime" };

// -- Stripe: create checkout session --
app.post("/api/create-checkout-session", async (req, res) => {
    if (!stripe) return res.status(503).json({ error: "Payment not configured." });
    try {
          const { planId, successUrl, cancelUrl, customerEmail } = req.body || {};
          if (!planId || !PLAN_PRICES[planId]) return res.status(400).json({ error: "Invalid plan" });

      const origin = req.headers.origin || "http://localhost:5173";
          const sessionParams = {
                  mode: "payment",
                  line_items: [{ price_data: { currency: "usd", product_data: { name: "Estate Land - " + (PLAN_NAMES[planId] || planId) }, unit_amount: PLAN_PRICES[planId] }, quantity: 1 }],
                  success_url: successUrl || (origin + "/get-started?success=1&session_id={CHECKOUT_SESSION_ID}"),
                  cancel_url:  cancelUrl  || (origin + "/get-started?payment=cancel"),
                  metadata: { planId },
                  allow_promotion_codes: true,
          };
          if (customerEmail && typeof customerEmail === "string" && customerEmail.includes("@")) {
                  sessionParams.customer_email = customerEmail;
          }
          const session = await stripe.checkout.sessions.create(sessionParams);
          return res.json({ url: session.url, sessionId: session.id });
    } catch (err) {
          console.error("Checkout session error:", err);
          return res.status(500).json({ error: String(err?.message || "Payment session failed") });
    }
});

// -- Stripe: retrieve checkout session (for frontend success page) --
app.get("/api/checkout-session/:id", async (req, res) => {
    if (!stripe) return res.status(503).json({ error: "Payment not configured" });
    try {
          const session = await stripe.checkout.sessions.retrieve(req.params.id);
          if (session.payment_status !== "paid") return res.status(400).json({ error: "Payment not completed" });
          return res.json({
                  id: session.id,
                  payment_status: session.payment_status,
                  amount_total: session.amount_total,
                  currency: session.currency,
                  customer_email: session.customer_email || session.customer_details?.email,
                  metadata: session.metadata || {},
          });
    } catch (err) {
          console.error("Retrieve session error:", err);
          return res.status(500).json({ error: err.message || "Failed to load session" });
    }
});

// -- Stripe Webhook: approved/rejected payment → Google Sheets --
app.post("/api/stripe-webhook", async (req, res) => {
    if (!stripe) return res.status(503).send("Stripe not configured");

           const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
          if (webhookSecret) {
                  event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], webhookSecret);
          } else {
                  event = JSON.parse(req.body.toString());
          }
    } catch (err) {
          console.error("Webhook error:", err.message);
          return res.status(400).send("Webhook Error: " + err.message);
    }

           if (event.type === "checkout.session.completed") {
                 const session = event.data.object;
                 const now = new Date().toISOString();
                 const planId = session.metadata?.planId || "";
                 const id = "pay_" + session.id;
                 const customerEmail = session.customer_email || session.customer_details?.email || "";
                 const status = session.payment_status === "paid" ? "approved" : session.payment_status;

      try {
              db.prepare("INSERT OR IGNORE INTO payments (id, amountTotal, currency, customerEmail, planId, stripeSessionId, paidAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
                .run(id, session.amount_total || 0, session.currency || "usd", customerEmail, planId, session.id, now);
      } catch (e) { console.error("Webhook DB error:", e.message); }

      if (SHEETS_READY) {
              appendPayment({ id, customerEmail, planId, amountTotal: session.amount_total || 0, currency: session.currency || "usd", status, stripeSessionId: session.id, paidAt: now })
                .catch(e => console.error("Sheets appendPayment error:", e));
      }
           }

           if (event.type === "checkout.session.async_payment_failed") {
                 const session = event.data.object;
                 const now = new Date().toISOString();
                 const planId = session.metadata?.planId || "";
                 const customerEmail = session.customer_email || session.customer_details?.email || "";

      if (SHEETS_READY) {
              appendPayment({ id: "pay_failed_" + session.id, customerEmail, planId, amountTotal: session.amount_total || 0, currency: session.currency || "usd", status: "rejected", stripeSessionId: session.id, paidAt: now })
                .catch(e => console.error("Sheets appendPayment(failed) error:", e));
      }
           }

           res.json({ received: true });
});

// -- GET all data --
app.get("/api/dashboard", (req, res) => {
    try {
          const users = db.prepare("SELECT * FROM users ORDER BY createdAt DESC").all();
          const leads = db.prepare("SELECT * FROM leads ORDER BY createdAt DESC").all();
          const rawSessions = db.prepare("SELECT * FROM onboarding_sessions ORDER BY startedAt DESC").all();
          const payments = db.prepare("SELECT * FROM payments ORDER BY paidAt DESC").all();
          const rawChats = db.prepare("SELECT * FROM chat_sessions ORDER BY startedAt DESC").all();

      const onboardingSessions = rawSessions.map(s => ({
              ...s,
              plan: JSON.parse(s.plan || "{}"),
              territory: JSON.parse(s.territory || "{}"),
              contact: JSON.parse(s.contact || "{}"),
      }));
          const chatSessions = rawChats.map(c => ({ ...c, messages: JSON.parse(c.messages || "[]") }));

      res.json({ users, leads, onboardingSessions, payments, chatSessions });
    } catch (err) {
          console.error("GET /api/dashboard error:", err);
          res.status(500).json({ error: err.message });
    }
});

// -- Users CRUD --
app.post("/api/users", (req, res) => {
    try {
          const u = req.body;
          const id = u.id || "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
          const now = new Date().toISOString();
          const today = now.slice(0, 10);

      db.prepare("INSERT INTO users (id, name, email, phone, brokerage, planId, region, zips, state, county, primaryArea, primarySMR, secondaryArea, secondarySMR, signupDate, documentSignDate, lastLeadSent, leadSentCount, ha, remarks, leadType, note, createdAt, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
              id, u.name||"", u.email||"", u.phone||"", u.brokerage||"", u.planId||"",
              u.region||"", u.zips||"", u.state||"", u.county||"",
              u.primaryArea||"", u.primarySMR||"", u.secondaryArea||"", u.secondarySMR||"",
              u.signupDate||today, u.documentSignDate||today, u.lastLeadSent||"", u.leadSentCount||0,
              u.ha||"", u.remarks||"", u.leadType||"", u.note||"", u.createdAt||now, u.password||""
            );

      const full = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
          if (SHEETS_READY) upsertRelator(full).catch(e => console.error("Sheets upsertRelator error:", e));
          res.json({ id });
    } catch (err) {
          console.error("POST /api/users error:", err);
          res.status(500).json({ error: err.message });
    }
});

app.put("/api/users/:id", (req, res) => {
    try {
          const updates = req.body;
          const cols = Object.keys(updates).filter(k => k !== "id");
          if (cols.length === 0) return res.json({ ok: true });
          const sets = cols.map(c => c + " = ?").join(", ");
          const vals = cols.map(c => updates[c]);
          db.prepare("UPDATE users SET " + sets + " WHERE id = ?").run(...vals, req.params.id);

      const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
          if (SHEETS_READY && updated) upsertRelator(updated).catch(e => console.error("Sheets upsertRelator error:", e));
          res.json({ ok: true });
    } catch (err) {
          console.error("PUT /api/users error:", err);
          res.status(500).json({ error: err.message });
    }
});

app.delete("/api/users/:id", (req, res) => {
    try {
          const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
          db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
          if (SHEETS_READY && user?.id) removeRelator(user.id).catch(e => console.error("Sheets removeRelator error:", e));
          res.json({ ok: true });
    } catch (err) {
          console.error("DELETE /api/users error:", err);
          res.status(500).json({ error: err.message });
    }
});

// -- Leads CRUD --
app.post("/api/leads", (req, res) => {
    try {
          const l = req.body;
          const id = l.id || "l_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
          const now = new Date().toISOString();
          db.prepare("INSERT INTO leads (id, address, notes, assignedToUserId, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)").run(
                  id, l.address||"", l.notes||"", l.assignedToUserId||"", l.status||"new", l.createdAt||now
                );
          res.json({ id });
    } catch (err) {
          console.error("POST /api/leads error:", err);
          res.status(500).json({ error: err.message });
    }
});

app.put("/api/leads/:id", (req, res) => {
    try {
          const updates = req.body;
          const cols = Object.keys(updates).filter(k => k !== "id");
          if (cols.length === 0) return res.json({ ok: true });
          const sets = cols.map(c => c + " = ?").join(", ");
          const vals = cols.map(c => updates[c]);
          db.prepare("UPDATE leads SET " + sets + " WHERE id = ?").run(...vals, req.params.id);
          res.json({ ok: true });
    } catch (err) {
          console.error("PUT /api/leads error:", err);
          res.status(500).json({ error: err.message });
    }
});

app.delete("/api/leads/:id", (req, res) => {
    try {
          db.prepare("DELETE FROM leads WHERE id = ?").run(req.params.id);
          res.json({ ok: true });
    } catch (err) {
          console.error("DELETE /api/leads error:", err);
          res.status(500).json({ error: err.message });
    }
});

// -- Onboarding sessions CRUD --
app.post("/api/onboarding", (req, res) => {
    try {
          const s = req.body;
          const id = s.id || "ob_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
          const now = new Date().toISOString();
          db.prepare("INSERT INTO onboarding_sessions (id, step, plan, territory, contact, startedAt, lastActivityAt, submittedAt, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
                  id, s.step||1, JSON.stringify(s.plan||{}), JSON.stringify(s.territory||{}),
                  JSON.stringify(s.contact||{}), s.startedAt||now, s.lastActivityAt||now, s.submittedAt||"", s.status||"in_progress"
                );
          res.json({ id });
    } catch (err) {
          console.error("POST /api/onboarding error:", err);
          res.status(500).json({ error: err.message });
    }
});

app.put("/api/onboarding/:id", (req, res) => {
    try {
          const s = req.body;
          const now = new Date().toISOString();
          const fields = [];
          const vals = [];

      if (s.step != null)        { fields.push("step = ?");        vals.push(s.step); }
          if (s.plan != null)        { fields.push("plan = ?");        vals.push(JSON.stringify(s.plan)); }
          if (s.territory != null)   { fields.push("territory = ?");   vals.push(JSON.stringify(s.territory)); }
          if (s.contact != null)     { fields.push("contact = ?");     vals.push(JSON.stringify(s.contact)); }
          if (s.status != null)      { fields.push("status = ?");      vals.push(s.status); }
          if (s.submittedAt != null) { fields.push("submittedAt = ?"); vals.push(s.submittedAt); }
          fields.push("lastActivityAt = ?");
          vals.push(s.lastActivityAt || now);

      if (fields.length === 0) return res.json({ ok: true });
          db.prepare("UPDATE onboarding_sessions SET " + fields.join(", ") + " WHERE id = ?").run(...vals, req.params.id);

      // Sync to Google Sheets whenever contact has a name or email
    // (fires on every update so we capture data before Stripe redirect)
    if (SHEETS_READY) {
      const full = db.prepare("SELECT * FROM onboarding_sessions WHERE id = ?").get(req.params.id);
      if (full) {
        try {
          const parsedContact = JSON.parse(full.contact || "{}");
          const parsedPlan = JSON.parse(full.plan || "{}");
          if (parsedContact.email || parsedContact.name || full.status === "submitted") {
            upsertOnboarding({
              ...full,
              plan: parsedPlan,
              territory: JSON.parse(full.territory || "{}"),
              contact: parsedContact,
            }).catch(e => console.error("Sheets upsertOnboarding error:", e));
          }
        } catch (parseErr) {
          console.error("Parse error in onboarding sync:", parseErr);
        }
      }
    }
        res.json({ ok: true });
    } catch (err) {
          console.error("PUT /api/onboarding error:", err);
          res.status(500).json({ error: err.message });
    }
});

// -- Payments CRUD --
app.post("/api/payments", (req, res) => {
    try {
          const p = req.body;
          const id = p.id || "pay_" + Date.now();
          const now = new Date().toISOString();
          db.prepare("INSERT OR IGNORE INTO payments (id, amountTotal, currency, customerEmail, planId, stripeSessionId, paidAt) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
                  id, p.amountTotal||0, p.currency||"usd", p.customerEmail||"", p.planId||"", p.stripeSessionId||"", p.paidAt||now
                );

      if (SHEETS_READY) {
              appendPayment({
                        id,
                        customerEmail: p.customerEmail||"",
                        planId: p.planId||"",
                        amountTotal: p.amountTotal||0,
                        currency: p.currency||"usd",
                        status: (p.amountTotal||0) > 0 ? "approved" : "pending",
                        stripeSessionId: p.stripeSessionId||"",
                        paidAt: p.paidAt||now,
              }).catch(e => console.error("Sheets appendPayment error:", e));
      }
          res.json({ id });
    } catch (err) {
          console.error("POST /api/payments error:", err);
          res.status(500).json({ error: err.message });
    }
});

// -- Chat sessions CRUD --
app.post("/api/chat-sessions", (req, res) => {
    try {
          const c = req.body;
          const id = c.id || "chat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
          const now = new Date().toISOString();
          db.prepare("INSERT INTO chat_sessions (id, startedAt, page, source, messages) VALUES (?, ?, ?, ?, ?)").run(
                  id, c.startedAt||now, c.page||"", c.source||"website", JSON.stringify(c.messages||[])
                );
          res.json({ id });
    } catch (err) {
          console.error("POST /api/chat-sessions error:", err);
          res.status(500).json({ error: err.message });
    }
});

app.put("/api/chat-sessions/:id", (req, res) => {
    try {
          const c = req.body;
          if (c.messages != null) {
                  db.prepare("UPDATE chat_sessions SET messages = ? WHERE id = ?").run(JSON.stringify(c.messages), req.params.id);
          }
          res.json({ ok: true });
    } catch (err) {
          console.error("PUT /api/chat-sessions error:", err);
          res.status(500).json({ error: err.message });
    }
});

// -- Serve static frontend build --
const staticDir = path.join(__dirname, "../dist");
if (existsSync(staticDir)) {
    app.use(express.static(staticDir));
    app.get("*", (req, res) => {
          if (!req.path.startsWith("/api")) {
                  res.sendFile(path.join(staticDir, "index.html"));
          }
    });
}

// -- Health check --
app.get("/api/health", (req, res) => {
    res.json({ ok: true, stripe: !!secretKey, db: true, sheets: SHEETS_READY });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
    if (!secretKey || !secretKey.startsWith("sk_")) console.warn("Stripe key missing.");
});
