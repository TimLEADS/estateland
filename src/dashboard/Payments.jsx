import { useDashboard } from "../context/DashboardContext.jsx";
import { C, THEME, font } from "./theme.js";

const T = THEME.dark;

function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function formatAmount(cents, currency = "USD") {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format((cents || 0) / 100);
}

export default function Payments() {
  const { payments } = useDashboard();

  const totalRevenue = (payments || []).reduce((sum, p) => sum + (p.amountTotal || 0), 0);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: font.display, fontSize: "clamp(24px, 3vw, 30px)", color: T.text, marginBottom: 6 }}>Payments</h1>
          <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute }}>
            Successful payments only. Shown after a realtor completes Stripe checkout.
          </p>
        </div>
        {payments && payments.length > 0 && (
          <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: "14px 20px", textAlign: "right" }}>
            <div style={{ fontFamily: font.body, fontSize: 11, color: "#22c55e", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Total Revenue</div>
            <div style={{ fontFamily: font.display, fontSize: 26, color: "#22c55e", fontWeight: 600 }}>{formatAmount(totalRevenue)}</div>
          </div>
        )}
      </div>

      {!payments || payments.length === 0 ? (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 48, textAlign: "center" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.mute} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, marginBottom: 16 }}>
            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute }}>No successful payments yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {payments.slice().reverse().map((p) => (
            <div
              key={p.id}
              style={{
                background: C.surface,
                border: `1px solid rgba(34,197,94,0.2)`,
                borderRadius: 14,
                padding: 24,
                position: "relative",
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(34,197,94,0.5)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(34,197,94,0.2)")}
            >
              <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: "#22c55e" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", flexShrink: 0, boxShadow: "0 0 8px rgba(34,197,94,0.4)" }} />
                <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: "#22c55e" }}>Payment successful</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, fontFamily: font.body, fontSize: 14, color: T.textDim }}>
                <div><strong style={{ color: T.mute, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>Amount</strong><br /><span style={{ color: T.text, fontSize: 18, fontFamily: font.display, fontWeight: 600 }}>{formatAmount(p.amountTotal, p.currency)}</span></div>
                <div><strong style={{ color: T.mute, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>Email</strong><br /><span style={{ color: T.text }}>{p.customerEmail || "—"}</span></div>
                <div><strong style={{ color: T.mute, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>Plan</strong><br /><span style={{ color: T.text, textTransform: "capitalize" }}>{p.planId || "—"}</span></div>
                <div><strong style={{ color: T.mute, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>Paid at</strong><br /><span style={{ color: T.text }}>{formatTime(p.paidAt)}</span></div>
              </div>
              {p.stripeSessionId && (
                <div style={{ fontFamily: font.body, fontSize: 11, color: T.mute, marginTop: 12, opacity: 0.7 }}>Session: {p.stripeSessionId}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
