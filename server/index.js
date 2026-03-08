import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import cors from "cors";
import Stripe from "stripe";
import Database from "better-sqlite3";
import { appendPayment, upsertRelator, removeRelator, upsertOnboarding, restoreFromSheets } from "./sheets.js";
import createEmailRoutes from "./emailRoutes.js";
import createTemplateRoutes from "./templateRoutes.js";

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

// ── Gmail / Email tables ──
db.exec(`
  CREATE TABLE IF NOT EXISTS gmail_tokens (
    id TEXT PRIMARY KEY DEFAULT 'default',
    encrypted_tokens TEXT DEFAULT '',
    iv TEXT DEFAULT '',
    auth_tag TEXT DEFAULT '',
    email TEXT DEFAULT '',
    createdAt TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY,
    name TEXT DEFAULT '',
    subject TEXT DEFAULT '',
    body TEXT DEFAULT '',
    createdAt TEXT DEFAULT '',
    updatedAt TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS email_contacts (
    id TEXT PRIMARY KEY,
    name TEXT DEFAULT '',
    email TEXT DEFAULT '' UNIQUE,
    lastMessageDate TEXT DEFAULT '',
    messageCount INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT ''
  );
`);

// Seed default email templates (HTML branded)
{
  const count = db.prepare("SELECT COUNT(*) as c FROM email_templates").get().c;
  // Always reseed if templates were plain text (upgrade path)
  const firstTpl = db.prepare("SELECT body FROM email_templates WHERE id = 'tpl_welcome'").get();
  const needsReseed = count === 0 || (firstTpl && !firstTpl.body.includes("<!DOCTYPE"));

  if (needsReseed) {
    // Clear old plain-text templates
    if (count > 0) db.prepare("DELETE FROM email_templates WHERE id IN ('tpl_welcome','tpl_realtor_intro','tpl_follow_up','tpl_meeting')").run();

    const now = new Date().toISOString();

    // Shared HTML wrapper
    const wrap = (content) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#080808;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#080808;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#0f0f0f;border:1px solid rgba(240,235,227,0.12);border-radius:12px;overflow:hidden;">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#0f0f0f 0%,#161616 100%);padding:32px 40px;border-bottom:1px solid rgba(240,235,227,0.12);">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td><table cellpadding="0" cellspacing="0"><tr>
<td style="width:40px;height:40px;border:2px solid #c9a227;border-radius:8px;text-align:center;vertical-align:middle;font-size:20px;color:#c9a227;font-weight:700;font-family:Georgia,serif;">E</td>
<td style="padding-left:14px;font-size:18px;font-weight:600;color:#f5f0e8;letter-spacing:1.5px;font-family:Georgia,serif;">ESTATE LAND</td>
</tr></table></td>
<td align="right" style="font-size:11px;color:rgba(245,240,232,0.5);letter-spacing:0.5px;">estateland.us</td>
</tr></table>
</td></tr>

<!-- Gold accent line -->
<tr><td style="height:3px;background:linear-gradient(90deg,#c9a227,#d4a574,#c9a227);"></td></tr>

<!-- Body -->
<tr><td style="padding:40px;">
${content}
</td></tr>

<!-- Footer -->
<tr><td style="padding:0 40px 12px;border-top:1px solid rgba(240,235,227,0.12);">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:24px 0 8px;">
<table cellpadding="0" cellspacing="0"><tr>
<td style="width:28px;height:28px;border:1px solid #c9a227;border-radius:6px;text-align:center;vertical-align:middle;font-size:14px;color:#c9a227;font-weight:700;font-family:Georgia,serif;">E</td>
<td style="padding-left:10px;font-size:13px;font-weight:600;color:#f5f0e8;letter-spacing:1px;font-family:Georgia,serif;">ESTATE LAND</td>
</tr></table>
</td></tr>
<tr><td style="font-size:12px;color:rgba(245,240,232,0.5);line-height:1.7;padding-bottom:16px;">
The exclusive lead platform for realtors across the United States.<br>
Exclusive leads. Your territory. No competition.
</td></tr>
<tr><td style="font-size:11px;color:rgba(245,240,232,0.35);padding-bottom:20px;">
www.estateland.us &nbsp;&middot;&nbsp; United States &middot; Serving all 50 states<br>
&copy; 2026 Estate Land. All rights reserved.
</td></tr>
</table>
</td></tr>

</table>
</td></tr></table>
</body></html>`;

    const seeds = [
      {
        id: "tpl_welcome", name: "Welcome Email",
        subject: "Welcome to EstateLand Lead Network",
        body: wrap(`<h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#f5f0e8;margin:0 0 8px;">Welcome to Estate Land</h1>
<p style="font-size:14px;color:#c9a227;margin:0 0 28px;letter-spacing:0.5px;">Your exclusive lead network starts here.</p>

<p style="font-size:15px;color:rgba(245,240,232,0.85);line-height:1.8;margin:0 0 20px;">Hello [Name],</p>

<p style="font-size:15px;color:rgba(245,240,232,0.85);line-height:1.8;margin:0 0 20px;">We are excited to have you join our real estate lead network. Estate Land connects realtors with <strong style="color:#f5f0e8;">double-verified seller leads</strong> — exclusive to you, straight to your CRM.</p>

<table cellpadding="0" cellspacing="0" style="margin:28px 0;width:100%;">
<tr><td style="padding:16px 20px;background:rgba(201,162,39,0.08);border-left:3px solid #c9a227;border-radius:0 8px 8px 0;">
<p style="font-size:14px;color:rgba(245,240,232,0.9);line-height:1.7;margin:0;"><strong style="color:#c9a227;">What to expect:</strong><br>
&bull; High-intent, verified seller prospects in your territory<br>
&bull; Leads delivered exclusively to you — never shared or recycled<br>
&bull; Appointments pre-set by our team so you can focus on closing</p>
</td></tr></table>

<p style="font-size:15px;color:rgba(245,240,232,0.85);line-height:1.8;margin:0 0 28px;">If you have any questions, feel free to reply directly to this email. We are here to help you dominate your market.</p>

<table cellpadding="0" cellspacing="0"><tr>
<td style="background:#c9a227;border-radius:8px;padding:14px 32px;">
<a href="https://www.estateland.us/get-started" style="font-size:13px;font-weight:600;color:#080808;text-decoration:none;letter-spacing:0.5px;">Get Started</a>
</td></tr></table>

<p style="font-size:14px;color:rgba(245,240,232,0.7);line-height:1.8;margin:28px 0 0;">Best regards,<br><strong style="color:#f5f0e8;">Estate Land Team</strong></p>`),
      },
      {
        id: "tpl_realtor_intro", name: "Realtor Introduction",
        subject: "Verified Real Estate Leads Available in Your Area",
        body: wrap(`<h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#f5f0e8;margin:0 0 8px;">Exclusive Leads in Your Area</h1>
<p style="font-size:14px;color:#c9a227;margin:0 0 28px;letter-spacing:0.5px;">Verified sellers. Your territory. No competition.</p>

<p style="font-size:15px;color:rgba(245,240,232,0.85);line-height:1.8;margin:0 0 20px;">Hello [Name],</p>

<p style="font-size:15px;color:rgba(245,240,232,0.85);line-height:1.8;margin:0 0 20px;">We are reaching out from <strong style="color:#f5f0e8;">Estate Land</strong> — the exclusive lead platform for top-performing realtors across the United States.</p>

<p style="font-size:15px;color:rgba(245,240,232,0.85);line-height:1.8;margin:0 0 20px;">Our platform connects real estate professionals with <strong style="color:#f5f0e8;">double-verified buyers, sellers, and investors</strong> actively looking for opportunities in their market.</p>

<table cellpadding="0" cellspacing="0" style="margin:28px 0;width:100%;">
<tr>
<td style="width:33%;padding:16px;text-align:center;background:rgba(201,162,39,0.06);border-radius:8px 0 0 8px;border-right:1px solid rgba(240,235,227,0.08);">
<div style="font-family:Georgia,serif;font-size:28px;color:#c9a227;font-weight:600;">89+</div>
<div style="font-size:11px;color:rgba(245,240,232,0.5);margin-top:4px;">Active Realtors</div>
</td>
<td style="width:33%;padding:16px;text-align:center;background:rgba(201,162,39,0.06);border-right:1px solid rgba(240,235,227,0.08);">
<div style="font-family:Georgia,serif;font-size:28px;color:#c9a227;font-weight:600;">50+</div>
<div style="font-size:11px;color:rgba(245,240,232,0.5);margin-top:4px;">US Markets</div>
</td>
<td style="width:33%;padding:16px;text-align:center;background:rgba(201,162,39,0.06);border-radius:0 8px 8px 0;">
<div style="font-family:Georgia,serif;font-size:28px;color:#c9a227;font-weight:600;">8+</div>
<div style="font-size:11px;color:rgba(245,240,232,0.5);margin-top:4px;">Years Experience</div>
</td>
</tr></table>

<p style="font-size:15px;color:rgba(245,240,232,0.85);line-height:1.8;margin:0 0 28px;">Every lead goes through our verification process to ensure they are genuine prospects. Would you be open to a short call so we can explain how the system works?</p>

<table cellpadding="0" cellspacing="0"><tr>
<td style="background:#c9a227;border-radius:8px;padding:14px 32px;">
<a href="https://www.estateland.us/get-started" style="font-size:13px;font-weight:600;color:#080808;text-decoration:none;letter-spacing:0.5px;">Schedule a Call</a>
</td></tr></table>

<p style="font-size:14px;color:rgba(245,240,232,0.7);line-height:1.8;margin:28px 0 0;">Looking forward to connecting,<br><strong style="color:#f5f0e8;">Estate Land Team</strong></p>`),
      },
      {
        id: "tpl_follow_up", name: "Follow Up Email",
        subject: "Quick Follow Up — Exclusive Leads for Your Market",
        body: wrap(`<h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#f5f0e8;margin:0 0 8px;">Quick Follow Up</h1>
<p style="font-size:14px;color:#c9a227;margin:0 0 28px;letter-spacing:0.5px;">Still interested in growing your listings?</p>

<p style="font-size:15px;color:rgba(245,240,232,0.85);line-height:1.8;margin:0 0 20px;">Hello [Name],</p>

<p style="font-size:15px;color:rgba(245,240,232,0.85);line-height:1.8;margin:0 0 20px;">Just following up on my previous email regarding <strong style="color:#f5f0e8;">exclusive, verified real estate leads</strong> through Estate Land.</p>

<p style="font-size:15px;color:rgba(245,240,232,0.85);line-height:1.8;margin:0 0 20px;">If you are currently looking for additional buyer or seller opportunities in your market, we would be happy to show you how our system works:</p>

<table cellpadding="0" cellspacing="0" style="margin:24px 0;width:100%;">
<tr><td style="padding:14px 20px;border-left:3px solid #c9a227;background:rgba(201,162,39,0.06);border-radius:0 8px 8px 0;">
<p style="font-size:14px;color:rgba(245,240,232,0.85);line-height:1.8;margin:0;">
&bull; Leads exclusive to your territory — <strong style="color:#c9a227;">never shared</strong><br>
&bull; Double-verified sellers ready to list<br>
&bull; Appointments booked directly into your calendar<br>
&bull; No long-term contracts required</p>
</td></tr></table>

<p style="font-size:15px;color:rgba(245,240,232,0.85);line-height:1.8;margin:0 0 28px;">Let me know if you are available for a quick 10-minute conversation. I would love to walk you through it.</p>

<table cellpadding="0" cellspacing="0"><tr>
<td style="background:#c9a227;border-radius:8px;padding:14px 32px;">
<a href="https://www.estateland.us/get-started" style="font-size:13px;font-weight:600;color:#080808;text-decoration:none;letter-spacing:0.5px;">Let&rsquo;s Connect</a>
</td></tr></table>

<p style="font-size:14px;color:rgba(245,240,232,0.7);line-height:1.8;margin:28px 0 0;">Best regards,<br><strong style="color:#f5f0e8;">Estate Land Team</strong></p>`),
      },
      {
        id: "tpl_meeting", name: "Meeting Confirmation",
        subject: "Your Call with Estate Land is Confirmed",
        body: wrap(`<h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#f5f0e8;margin:0 0 8px;">Meeting Confirmed</h1>
<p style="font-size:14px;color:#c9a227;margin:0 0 28px;letter-spacing:0.5px;">We look forward to speaking with you.</p>

<p style="font-size:15px;color:rgba(245,240,232,0.85);line-height:1.8;margin:0 0 20px;">Hello [Name],</p>

<p style="font-size:15px;color:rgba(245,240,232,0.85);line-height:1.8;margin:0 0 20px;">Thank you for scheduling a call with the <strong style="color:#f5f0e8;">Estate Land</strong> team. We are looking forward to connecting with you.</p>

<table cellpadding="0" cellspacing="0" style="margin:28px 0;width:100%;background:rgba(201,162,39,0.06);border-radius:12px;overflow:hidden;">
<tr><td style="padding:28px 24px;text-align:center;">
<div style="font-size:12px;color:#c9a227;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;font-weight:600;">During Our Call</div>
<div style="font-size:14px;color:rgba(245,240,232,0.85);line-height:2;">
How our exclusive lead system works<br>
Your territory and market opportunity<br>
Lead verification and delivery process<br>
Pricing and membership options
</div>
</td></tr></table>

<p style="font-size:15px;color:rgba(245,240,232,0.85);line-height:1.8;margin:0 0 20px;">If you need to reschedule, simply reply to this email and we will accommodate you.</p>

<p style="font-size:15px;color:rgba(245,240,232,0.85);line-height:1.8;margin:0 0 28px;">Talk soon.</p>

<table cellpadding="0" cellspacing="0"><tr>
<td style="background:#c9a227;border-radius:8px;padding:14px 32px;">
<a href="https://www.estateland.us" style="font-size:13px;font-weight:600;color:#080808;text-decoration:none;letter-spacing:0.5px;">Visit Estate Land</a>
</td></tr></table>

<p style="font-size:14px;color:rgba(245,240,232,0.7);line-height:1.8;margin:28px 0 0;">Warm regards,<br><strong style="color:#f5f0e8;">Estate Land Team</strong></p>`),
      },
    ];
    const insert = db.prepare("INSERT OR REPLACE INTO email_templates (id, name, subject, body, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)");
    for (const t of seeds) insert.run(t.id, t.name, t.subject, t.body, now, now);
    console.log("Seeded 4 branded HTML email templates.");
  }
}

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

// -- Restore data from Google Sheets on startup --
// Reloads users/onboarding/payments into SQLite so data survives Render restarts.
if (SHEETS_READY) {
  restoreFromSheets(db).catch(e => console.error("[Restore] startup error:", e.message));
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
app.use(express.json({ limit: "25mb" }));

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

// ── Email & Template routes ──
app.use("/api", createEmailRoutes(db));
app.use("/api/templates", createTemplateRoutes(db));

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
