import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import cors from "cors";
import Stripe from "stripe";

const secretKey = (process.env.STRIPE_SECRET_KEY || "").trim();
if (!secretKey || !secretKey.startsWith("sk_")) {
    console.error("Missing or invalid STRIPE_SECRET_KEY in server/.env — payment will fail until fixed.");
}

const stripe = secretKey ? new Stripe(secretKey) : null;

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const PLAN_PRICES = {
    launch: 32900,
    growth: 54900,
    premier: 105000,
};

const PLAN_NAMES = {
    launch: "Launch — 6 months",
    growth: "Growth — per year",
    premier: "Premier — lifetime",
};

// ── Create checkout session ──
app.post("/api/create-checkout-session", async (req, res) => {
    if (!stripe) {
        return res.status(503).json({
            error: "Payment not configured. Add STRIPE_SECRET_KEY to server/.env and restart.",
        });
    }

    try {
        const { planId, successUrl, cancelUrl, customerEmail } = req.body || {};

        if (!planId || !PLAN_PRICES[planId]) {
            return res.status(400).json({ error: "Invalid plan" });
        }

        const amount = PLAN_PRICES[planId];
        const productName = PLAN_NAMES[planId] || planId;
        const origin = req.headers.origin || "http://localhost:5173";

        const sessionParams = {
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: { name: `Estate Land — ${productName}` },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            success_url: successUrl || `${origin}/get-started?success=1`,
            cancel_url: cancelUrl || `${origin}/get-started?payment=cancel`,
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
        const message =
            (err && (err.message || err.raw?.message || err.code)) ||
            "Payment session failed";
        return res.status(500).json({ error: String(message) });
    }
});

app.get("/api/checkout-session/:id", async (req, res) => {
    if (!stripe) return res.status(503).json({ error: "Payment not configured" });
    try {
        const session = await stripe.checkout.sessions.retrieve(req.params.id);
        if (session.payment_status !== "paid") {
            return res.status(400).json({ error: "Payment not completed" });
        }
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

app.get("/api/health", (req, res) => {
    res.json({ ok: true, stripe: !!secretKey });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (!secretKey || !secretKey.startsWith("sk_")) {
        console.warn("Stripe key missing — add STRIPE_SECRET_KEY to server/.env");
    }
});
