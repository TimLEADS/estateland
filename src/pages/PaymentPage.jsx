import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PRICING_PLANS, THEME, font } from "../../EstateLand.jsx";
import { useDashboard } from "../context/DashboardContext.jsx";

const CHECKOUT_DATA_KEY = "estateland_checkout_data";

const sectionStyle = { marginBottom: 56 };
const labelStyle = { fontFamily: font.body, fontSize: 12, fontWeight: 600, color: "#0f0f0f", letterSpacing: 0.08, display: "block", marginBottom: 8 };
const inputStyle = (T) => ({
  width: "100%", padding: "16px 20px", fontFamily: font.body, fontSize: 15, color: T.text,
  background: "rgba(255,255,255,0.9)", border: `1px solid ${T.border}`, borderRadius: 12, outline: "none",
});

export default function PaymentPage() {
  const navigate = useNavigate();
  const { submitOnboarding } = useDashboard();
  const [data, setData] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const T = THEME.light;

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CHECKOUT_DATA_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch (_) {}
  }, []);

  const handleProceedToPayment = async () => {
    if (!data?.plan?.id) {
      setPaymentError("Missing plan. Please go back and complete the form.");
      return;
    }
    if (!data?.contact?.name?.trim() || !data?.contact?.email?.trim()) {
      setPaymentError("Missing name or email. Please go back and complete the form.");
      return;
    }
    setPaymentError("");
    setPaymentLoading(true);
    if (data.sessionId) {
      submitOnboarding(data.sessionId, { plan: data.plan, territory: data.territory || {}, contact: data.contact });
    }
    try {
      sessionStorage.setItem("estateland_pending_submission", JSON.stringify({ plan: data.plan, contact: data.contact }));
    } catch (_) {}
    try {
      const origin = window.location.origin;
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: data.plan.id,
          couponCode: couponCode.trim() || undefined,
          successUrl: `${origin}/get-started?success=1&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/get-started/payment`,
          customerEmail: data.contact.email,
        }),
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(resData.error || "Payment failed");
      if (resData.url) window.location.href = resData.url;
      else throw new Error("No checkout URL");
    } catch (err) {
      setPaymentError(err.message || "Could not start checkout");
      setPaymentLoading(false);
    }
  };

  const plan = data?.plan ? PRICING_PLANS.find((p) => p.id === data.plan.id) || data.plan : null;

  if (data === null) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ fontFamily: font.body, fontSize: 16, color: T.mute, marginBottom: 24 }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!data?.plan || !data?.contact?.email) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(166,124,0,0.06) 0%, transparent 50%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "clamp(80px, 12vw, 140px) 24px", textAlign: "center" }}>
          <h1 style={{ fontFamily: font.display, fontSize: "clamp(28px, 4vw, 36px)", color: T.text, marginBottom: 16 }}>Complete your details first</h1>
          <p style={{ fontFamily: font.body, fontSize: 16, color: T.mute, marginBottom: 32, lineHeight: 1.6 }}>Choose your plan and fill in your details on the previous page, then continue to payment.</p>
          <Link to="/get-started" className="gold-btn" style={{ padding: "16px 40px", fontSize: 12, letterSpacing: 0.12, textDecoration: "none" }}>Back to Get started</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(166,124,0,0.06) 0%, transparent 50%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 520, margin: "0 auto", padding: "clamp(48px, 8vw, 80px) 24px 120px" }}>
        <h1 style={{ fontFamily: font.display, fontSize: "clamp(28px, 4vw, 36px)", color: T.text, lineHeight: 1.15, marginBottom: 12 }}>
          Payment
        </h1>
        <p style={{ fontFamily: font.body, fontSize: 16, color: T.mute, marginBottom: 40, lineHeight: 1.6 }}>
          Review your order and enter a coupon if you have one.
        </p>

        <section style={sectionStyle}>
          <h2 style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: T.accent, letterSpacing: 0.1, marginBottom: 20, textTransform: "uppercase" }}>Order summary</h2>
          {plan && (
            <div style={{ padding: "20px 24px", borderRadius: 12, background: "rgba(166,124,0,0.08)", border: `1px solid rgba(166,124,0,0.25)`, marginBottom: 24 }}>
              <div style={{ fontFamily: font.display, fontSize: 20, color: T.text, fontWeight: 600 }}>{plan.name}</div>
              <div style={{ fontFamily: font.body, fontSize: 14, color: T.mute, marginTop: 4 }}>{plan.price} · {plan.period}</div>
              {data.contact?.name && <div style={{ fontFamily: font.body, fontSize: 13, color: T.textDim, marginTop: 12 }}>{data.contact.name} · {data.contact.email}</div>}
            </div>
          )}

          <label style={{ display: "block", marginBottom: 20 }}>
            <span style={labelStyle}>Coupon</span>
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => { setCouponCode(e.target.value); setPaymentError(""); }}
              style={inputStyle(T)}
            />
          </label>

          {paymentError && <p style={{ fontFamily: font.body, fontSize: 13, color: "#c62828", marginBottom: 16 }}>{paymentError}</p>}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              className="gold-btn"
              disabled={paymentLoading}
              onClick={handleProceedToPayment}
              style={{ padding: "18px 48px", fontSize: 12, letterSpacing: 0.12 }}
            >
              {paymentLoading ? "Redirecting…" : "Proceed to payment"}
            </button>
            <Link to="/get-started" style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: T.mute, padding: "18px 24px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              ← Back
            </Link>
          </div>
        </section>
      </div>
      <style>{`.gold-btn:disabled { cursor: not-allowed; }`}</style>
    </div>
  );
}
