import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PRICING_PLANS, THEME, font } from "../../EstateLand.jsx";
import { useDashboard } from "../context/DashboardContext.jsx";

const US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma",
    "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee",
    "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "District of Columbia"
  ];

const LEAD_TYPES = [
  { value: "buyer", label: "Buyer leads only" },
  { value: "seller", label: "Seller leads only" },
  { value: "both", label: "Both buyer & seller" },
  ];

const SESSION_KEY = "estateland_onboarding_session";
const CHECKOUT_DATA_KEY = "estateland_checkout_data";

const sectionStyle = { marginBottom: 56 };
const labelStyle = { fontFamily: font.body, fontSize: 12, fontWeight: 600, color: "#0f0f0f", letterSpacing: 0.08, display: "block", marginBottom: 8 };
const inputStyle = (T) => ({
    width: "100%", padding: "16px 20px", fontFamily: font.body, fontSize: 15, color: T.text,
    background: "rgba(255,255,255,0.9)", border: `1px solid ${T.border}`, borderRadius: 12, outline: "none",
});

// Plan prices in cents for discount calculations
const PLAN_PRICE_CENTS = { launch: 32900, growth: 54900, premier: 105000 };

export default function Onboarding() {
    const [searchParams] = useSearchParams();
    const planParam = searchParams.get("plan");
    const { startOnboardingSession, updateOnboardingSession, submitOnboarding, addPayment, createUser, users, submittedSessions } = useDashboard();

  const sessionIdRef = useRef(null);
    const recordedPaymentRef = useRef(false);
    const recordedUserRef = useRef(false);

  const [selectedPlan, setSelectedPlan] = useState(null);
    const [details, setDetails] = useState({
          name: "", phone: "", email: "", state: "", primaryAreas: "", secondaryAreas: "", radius: "", leadType: "both", note: "",
    });
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentError, setPaymentError] = useState("");

  // ── Coupon state ──
  const [couponCode, setCouponCode] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponResult, setCouponResult] = useState(null); // { valid, percentOff, promoCodeId, code } or null
  const [couponError, setCouponError] = useState("");

  const T = THEME.light;
    const paymentSuccess = searchParams.get("success") === "1";

  useEffect(() => {
        if (!sessionIdRef.current) {
                sessionIdRef.current = startOnboardingSession();
                try { sessionStorage.setItem(SESSION_KEY, sessionIdRef.current); } catch (_) {}
        }
  }, [startOnboardingSession]);

  useEffect(() => {
        if (planParam && PRICING_PLANS.some((p) => p.id === planParam)) {
                setSelectedPlan(PRICING_PLANS.find((p) => p.id === planParam));
        }
  }, [planParam]);

  useEffect(() => {
        if (sessionIdRef.current) {
                updateOnboardingSession(sessionIdRef.current, 1, { plan: selectedPlan, contact: details, territory: {} });
        }
  }, [selectedPlan, details, updateOnboardingSession]);

  // ── Coupon handlers ──
  const handleApplyCoupon = async () => {
        const code = couponCode.trim().toUpperCase();
        if (!code) return;
        setCouponLoading(true);
        setCouponError("");
        setCouponResult(null);
        try {
                const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
                const res = await fetch(`${apiBase}/api/validate-coupon`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ code }),
                });
                const data = await res.json().catch(() => ({}));
                if (data.valid) {
                          setCouponResult({ valid: true, percentOff: data.percentOff, promoCodeId: data.promoCodeId, code: data.code });
                          setCouponError("");
                } else {
                          setCouponResult(null);
                          setCouponError("\u274c Invalid coupon code");
                }
        } catch (err) {
                setCouponResult(null);
                setCouponError("\u274c Could not validate coupon. Please try again.");
        }
        setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
        setCouponResult(null);
        setCouponError("");
        setCouponCode("");
  };

  // Calculate discounted price
  const getDiscountedPrice = (planId) => {
        if (!couponResult?.valid || !planId) return null;
        const cents = PLAN_PRICE_CENTS[planId];
        if (!cents) return null;
        const discounted = Math.round(cents * (1 - couponResult.percentOff / 100));
        return (discounted / 100).toFixed(2);
  };

  const getOriginalPriceCents = (planId) => PLAN_PRICE_CENTS[planId] || 0;

  const handleProceedToPayment = async () => {
        if (!selectedPlan?.id) { setPaymentError("Please select a plan."); return; }
        if (!details?.name?.trim() || !details?.email?.trim()) { setPaymentError("Please fill in your name and email."); return; }
        setPaymentError("");
        setPaymentLoading(true);

        if (sessionIdRef.current) {
                submitOnboarding(sessionIdRef.current, { plan: selectedPlan, territory: {}, contact: details });
        }

        try { sessionStorage.setItem("estateland_pending_submission", JSON.stringify({ plan: selectedPlan, contact: details })); } catch (_) {}

        try {
                const origin = window.location.origin;
                const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
                const body = {
                          planId: selectedPlan.id,
                          successUrl: `${origin}/get-started?success=1&session_id={CHECKOUT_SESSION_ID}`,
                          cancelUrl: `${origin}/get-started`,
                          customerEmail: details.email,
                };
                // Pass promoCodeId if coupon was validated
          if (couponResult?.valid && couponResult.promoCodeId) {
                    body.promoCodeId = couponResult.promoCodeId;
          }
                const res = await fetch(`${apiBase}/api/create-checkout-session`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(body),
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

  const stripeSessionId = searchParams.get("session_id");
    useEffect(() => {
          if (!paymentSuccess || !stripeSessionId || recordedPaymentRef.current) return;
          let cancelled = false;
          (async () => {
                  try {
                            const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
                            const res = await fetch(`${apiBase}/api/checkout-session/${stripeSessionId}`);
                            const data = await res.json();
                            if (cancelled) return;
                            if (res.ok && data.payment_status === "paid") {
                                        recordedPaymentRef.current = true;
                                        addPayment({ stripeSessionId: data.id, amountTotal: data.amount_total, currency: (data.currency || "usd").toUpperCase(), customerEmail: data.customer_email, planId: data.metadata?.planId });
                                        if (!recordedUserRef.current) {
                                                      let sub = null;
                                                      try { const raw = sessionStorage.getItem("estateland_pending_submission"); if (raw) sub = JSON.parse(raw); } catch (_) {}
                                                      if (!sub && data.customer_email) {
                                                                      const sessions = (submittedSessions || []).filter((s) => (s.contact?.email || "").toLowerCase() === (data.customer_email || "").toLowerCase());
                                                                      sub = sessions.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0))[0];
                                                      }
                                                      const existingUser = (users || []).find((u) => (u.email || "").toLowerCase() === ((sub?.contact?.email || data.customer_email) || "").toLowerCase());
                                                      if (sub && !existingUser) {
                                                                      recordedUserRef.current = true;
                                                                      const c = sub.contact || {};
                                                                      const today = new Date().toISOString().slice(0, 10);
                                                                      createUser({ name: c.name || "", email: c.email || data.customer_email || "", phone: c.phone || "", planId: sub.plan?.id || data.metadata?.planId || "", region: sub.territory?.region || "", zips: sub.territory?.zips || "", state: c.state || "", primaryArea: c.primaryAreas || "", primarySMR: c.radius || "", secondaryArea: c.secondaryAreas || "", secondarySMR: "", leadType: c.leadType || "", note: c.note || "", signupDate: today, documentSignDate: today });
                                                                      try { sessionStorage.removeItem("estateland_pending_submission"); } catch (_) {}
                                                      }
                                        }
                            }
                  } catch (_) {}
          })();
          return () => { cancelled = true; };
    }, [paymentSuccess, stripeSessionId, addPayment, createUser, users, submittedSessions]);

  if (paymentSuccess) {
        return (
                <div style={{ minHeight: "100vh", background: T.bg, position: "relative", overflow: "hidden" }}>
                          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(166,124,0,0.06) 0%, transparent 50%)", pointerEvents: "none" }} />
                          <div style={{ position: "relative", zIndex: 1, maxWidth: 560, margin: "0 auto", padding: "clamp(80px, 12vw, 140px) 24px", textAlign: "center" }}>
                                      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(166,124,0,0.15)", border: `2px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", fontSize: 36, color: T.accent }}>{"\u2713"}</div>div>
                                      <h1 style={{ fontFamily: font.display, fontSize: "clamp(32px, 4.5vw, 44px)", color: T.text, lineHeight: 1.15, marginBottom: 16 }}>
                                                    You're all <em style={{ color: T.accent, fontStyle: "italic" }}>set</em>em>
                                      </h1>h1>
                                      <p style={{ fontFamily: font.body, fontSize: 17, color: T.mute, maxWidth: 420, margin: "0 auto 40px", lineHeight: 1.65 }}>
                                                    Payment received. Our team will contact you within 2 hours to complete your setup.
                                      </p>p>
                                      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
                                                    <Link to="/" className="gold-btn" style={{ padding: "16px 40px", fontSize: 12, letterSpacing: 0.12, textDecoration: "none" }}>Back to home</Link>Link>
                                                    <Link to="/dashboard/login" style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: T.accent, textDecoration: "none" }}>Go to dashboard {"\u2192"}</Link>Link>
                                      </div>div>
                          </div>div>
                </div>div>
              );
  }

  return (
        <div style={{ minHeight: "100vh", background: T.bg, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(166,124,0,0.06) 0%, transparent 50%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to top, rgba(0,0,0,0.02), transparent)", pointerEvents: "none" }} />
                <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "clamp(48px, 8vw, 80px) 24px 120px" }}>

                          <h1 style={{ fontFamily: font.display, fontSize: "clamp(32px, 4.5vw, 44px)", color: T.text, lineHeight: 1.15, marginBottom: 12 }}>
                                      Get <em style={{ color: T.accent, fontStyle: "italic" }}>started</em>em>
                          </h1>h1>
                          <p style={{ fontFamily: font.body, fontSize: 16, color: T.mute, marginBottom: 48, lineHeight: 1.6 }}>
                                      Choose your plan, add your details, and complete payment — all on this page.
                          </p>p>

                  {/* ── Plan selection ── */}
                          <section style={sectionStyle}>
                                      <h2 style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: T.accent, letterSpacing: 0.1, marginBottom: 20, textTransform: "uppercase" }}>Choose plan</h2>h2>
                                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                        {PRICING_PLANS.map((p) => {
                        const isSelected = selectedPlan?.id === p.id;
                        const discountedPrice = getDiscountedPrice(p.id);
                        return (
                                          <button key={p.id} type="button" onClick={() => setSelectedPlan(p)}
                                                              style={{
                                                                                    width: "100%", textAlign: "left", padding: "24px 28px", borderRadius: 16,
                                                                                    border: `2px solid ${isSelected ? T.accent : T.border}`,
                                                                                    background: isSelected ? "rgba(166,124,0,0.08)" : "rgba(255,255,255,0.8)",
                                                                                    boxShadow: isSelected ? "0 8px 32px rgba(166,124,0,0.12)" : "0 4px 20px rgba(0,0,0,0.04)",
                                                                                    cursor: "pointer", transition: "all 0.3s ease",
                                                              }}
                                                              onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = "rgba(166,124,0,0.35)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.08)"; } }}
                                                              onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.04)"; } }}
                                                            >
                                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                                                                                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                                                                                                      <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${isSelected ? T.accent : T.border}`, background: isSelected ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                                                        {isSelected && <span style={{ color: T.bg, fontSize: 12, fontWeight: 700 }}>{"\u2713"}</span>span>}
                                                                                                        </div>div>
                                                                                                      <div>
                                                                                                                              <div style={{ fontFamily: font.display, fontSize: 22, color: T.text, fontWeight: 600 }}>{p.name}</div>div>
                                                                                                                              <div style={{ fontFamily: font.body, fontSize: 14, color: T.mute, marginTop: 2 }}>
                                                                                                                                {discountedPrice ? (
                                                                                          <>
                                                                                                                        <span style={{ textDecoration: "line-through", opacity: 0.5 }}>{p.price}</span>span>
                                                                                            {" "}
                                                                                                                        <span style={{ color: "#c5a336", fontWeight: 700 }}>${discountedPrice}</span>span>
                                                                                                                        <span style={{ color: "#2e7d32", fontSize: 12, marginLeft: 6 }}>({couponResult.percentOff}% off)</span>span>
                                                                                            </>>
                                                                                        ) : (
                                                                                          <>{p.price}</>>
                                                                                        )}
                                                                                                                                {" \u00b7 "}{p.period}{" \u00b7 "}{p.fee}
                                                                                                                                </div>div>
                                                                                                        </div>div>
                                                                                  </div>div>
                                                              {p.popular && <span style={{ fontFamily: font.body, fontSize: 10, fontWeight: 700, letterSpacing: 0.12, color: T.accent, background: "rgba(166,124,0,0.15)", padding: "6px 12px", borderRadius: 20 }}>Most popular</span>span>}
                                                            </div>div>
                                          </button>button>
                                        );
        })}
                                      </div>div>
                          </section>section>
                
                  {/* ── Your details ── */}
                        <section style={sectionStyle}>
                                  <h2 style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: T.accent, letterSpacing: 0.1, marginBottom: 20, textTransform: "uppercase" }}>Your details</h2>h2>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                              <label style={{ display: "block" }}>
                                                            <span style={labelStyle}>Name</span>span>
                                                            <input type="text" value={details.name} onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))} placeholder="Full name" required style={inputStyle(T)} />
                                              </label>label>
                                              <label style={{ display: "block" }}>
                                                            <span style={labelStyle}>Phone</span>span>
                                                            <input type="tel" value={details.phone} onChange={(e) => setDetails((d) => ({ ...d, phone: e.target.value }))} placeholder="(555) 123-4567" style={inputStyle(T)} />
                                              </label>label>
                                              <label style={{ display: "block" }}>
                                                            <span style={labelStyle}>Email</span>span>
                                                            <input type="email" value={details.email} onChange={(e) => setDetails((d) => ({ ...d, email: e.target.value }))} placeholder="you@example.com" required style={inputStyle(T)} />
                                              </label>label>
                                              <label style={{ display: "block" }}>
                                                            <span style={labelStyle}>State</span>span>
                                                            <select value={details.state} onChange={(e) => setDetails((d) => ({ ...d, state: e.target.value }))} style={{ ...inputStyle(T), cursor: "pointer" }}>
                                                                            <option value="">Select state</option>option>
                                                              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>option>)}
                                                            </select>select>
                                              </label>label>
                                              <label style={{ display: "block" }}>
                                                            <span style={labelStyle}>Primary areas</span>span>
                                                            <input type="text" value={details.primaryAreas} onChange={(e) => setDetails((d) => ({ ...d, primaryAreas: e.target.value }))} placeholder="e.g. Phoenix, Scottsdale" style={inputStyle(T)} />
                                              </label>label>
                                              <label style={{ display: "block" }}>
                                                            <span style={labelStyle}>Secondary areas</span>span>
                                                            <input type="text" value={details.secondaryAreas} onChange={(e) => setDetails((d) => ({ ...d, secondaryAreas: e.target.value }))} placeholder="e.g. Tempe, Mesa" style={inputStyle(T)} />
                                              </label>label>
                                              <label style={{ display: "block" }}>
                                                            <span style={labelStyle}>Radius (miles)</span>span>
                                                            <input type="text" value={details.radius} onChange={(e) => setDetails((d) => ({ ...d, radius: e.target.value }))} placeholder="e.g. 30" style={inputStyle(T)} />
                                              </label>label>
                                              <label style={{ display: "block" }}>
                                                            <span style={labelStyle}>Type of leads</span>span>
                                                            <select value={details.leadType} onChange={(e) => setDetails((d) => ({ ...d, leadType: e.target.value }))} style={{ ...inputStyle(T), cursor: "pointer" }}>
                                                              {LEAD_TYPES.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>option>)}
                                                            </select>select>
                                              </label>label>
                                              <label style={{ display: "block" }}>
                                                            <span style={labelStyle}>Note</span>span>
                                                            <textarea value={details.note} onChange={(e) => setDetails((d) => ({ ...d, note: e.target.value }))} placeholder="Any additional notes..." rows={3} style={{ ...inputStyle(T), resize: "vertical", minHeight: 80 }} />
                                              </label>label>
                                  
                                    {/* ── Coupon Code Section ── */}
                                              <div style={{ padding: "24px", borderRadius: 16, background: "rgba(255,255,255,0.6)", border: `1px solid ${T.border}` }}>
                                                            <span style={{ ...labelStyle, marginBottom: 12 }}>Coupon Code</span>span>
                                                            <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
                                                                            <input
                                                                                                type="text"
                                                                                                value={couponCode}
                                                                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                                                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApplyCoupon(); } }}
                                                                                                placeholder="Enter promo code"
                                                                                                style={{ ...inputStyle(T), flex: 1, textTransform: "uppercase", letterSpacing: 1 }}
                                                                                                disabled={couponLoading || !!couponResult?.valid}
                                                                                              />
                                                              {!couponResult?.valid ? (
                            <button
                                                  type="button"
                                                  onClick={handleApplyCoupon}
                                                  disabled={couponLoading || !couponCode.trim()}
                                                  style={{
                                                                          padding: "16px 28px", fontFamily: font.body, fontSize: 13, fontWeight: 700,
                                                                          letterSpacing: 0.08, color: "#fff", background: "#c5a336",
                                                                          border: "none", borderRadius: 12, cursor: couponLoading || !couponCode.trim() ? "not-allowed" : "pointer",
                                                                          opacity: couponLoading || !couponCode.trim() ? 0.6 : 1, transition: "opacity 0.2s",
                                                                          whiteSpace: "nowrap",
                                                  }}
                                                >
                              {couponLoading ? "Checking\u2026" : "Apply"}
                            </button>button>
                          ) : (
                            <button
                                                  type="button"
                                                  onClick={handleRemoveCoupon}
                                                  style={{
                                                                          padding: "16px 28px", fontFamily: font.body, fontSize: 13, fontWeight: 700,
                                                                          letterSpacing: 0.08, color: "#c62828", background: "rgba(198,40,40,0.08)",
                                                                          border: "1px solid rgba(198,40,40,0.2)", borderRadius: 12, cursor: "pointer",
                                                                          whiteSpace: "nowrap",
                                                  }}
                                                >
                                                Remove
                            </button>button>
                                                                            )}
                                                            </div>div>
                                              
                                                {/* Coupon success message */}
                                                {couponResult?.valid && (
                          <div style={{ marginTop: 14 }}>
                                            <p style={{ fontFamily: font.body, fontSize: 14, color: "#2e7d32", fontWeight: 600, margin: 0 }}>
                                              {"\u2705"} Coupon applied! You get {couponResult.percentOff}% off
                                            </p>p>
                            {selectedPlan?.id && (
                                                <div style={{ marginTop: 8, padding: "12px 16px", borderRadius: 10, background: "rgba(46,125,50,0.06)", border: "1px solid rgba(46,125,50,0.15)" }}>
                                                                      <span style={{ fontFamily: font.body, fontSize: 13, color: T.mute }}>
                                                                                              <span style={{ textDecoration: "line-through" }}>${(getOriginalPriceCents(selectedPlan.id) / 100).toFixed(2)}</span>span>
                                                                        {" \u2192 "}
                                                                                              <span style={{ color: "#c5a336", fontWeight: 700, fontSize: 16 }}>${getDiscountedPrice(selectedPlan.id)}</span>span>
                                                                                              <span style={{ marginLeft: 8, color: "#2e7d32", fontSize: 12 }}>({couponResult.percentOff}% discount)</span>span>
                                                                      </span>span>
                                                </div>div>
                                            )}
                          </div>div>
                                                            )}
                                              
                                                {/* Coupon error message */}
                                                {couponError && (
                          <p style={{ fontFamily: font.body, fontSize: 13, color: "#c62828", marginTop: 10, marginBottom: 0 }}>{couponError}</p>p>
                                                            )}
                                              </div>div>
                                  
                                    {paymentError && <p style={{ fontFamily: font.body, fontSize: 13, color: "#c62828", marginBottom: 8 }}>{paymentError}</p>p>}
                                  
                                              <div style={{ marginTop: 8 }}>
                                                            <button type="button" className="gold-btn" onClick={handleProceedToPayment}
                                                                              disabled={paymentLoading || !selectedPlan?.id || !details?.name?.trim() || !details?.email?.trim()}
                                                                              style={{ padding: "18px 48px", fontSize: 12, letterSpacing: 0.12 }}
                                                                            >
                                                              {paymentLoading ? "Redirecting\u2026" : "Proceed to payment"}
                                                            </button>button>
                                              </div>div>
                                  </div>div>
                        </section>section>
                </div>div>
              <style>{`.gold-btn:disabled { cursor: not-allowed; opacity: 0.7; }`}</style>style>
        </div>div>
      );
}
