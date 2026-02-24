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

  return (
    <div>
      <h1 style={{ fontFamily: font.display, fontSize: 28, color: T.text, marginBottom: 8 }}>Payments</h1>
      <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute, marginBottom: 32 }}>
        Successful payments only. Shown after a realtor completes Stripe checkout.
      </p>

      {!payments || payments.length === 0 ? (
        <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute }}>No successful payments yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {payments.slice().reverse().map((p) => (
            <div
              key={p.id}
              style={{
                background: C.surface,
                border: `1px solid rgba(34,197,94,0.3)`,
                borderRadius: 12,
                padding: 24,
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{
                  width: 12, height: 12, borderRadius: "50%", background: "#22c55e", flexShrink: 0,
                }} />
                <span style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: "#22c55e" }}>Payment successful</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, fontFamily: font.body, fontSize: 14, color: T.textDim }}>
                <div><strong style={{ color: T.mute }}>Amount</strong><br /><span style={{ color: T.text }}>{formatAmount(p.amountTotal, p.currency)}</span></div>
                <div><strong style={{ color: T.mute }}>Email</strong><br /><span style={{ color: T.text }}>{p.customerEmail || "—"}</span></div>
                <div><strong style={{ color: T.mute }}>Plan</strong><br /><span style={{ color: T.text }}>{p.planId || "—"}</span></div>
                <div><strong style={{ color: T.mute }}>Paid at</strong><br /><span style={{ color: T.text }}>{formatTime(p.paidAt)}</span></div>
              </div>
              {p.stripeSessionId && (
                <div style={{ fontFamily: font.body, fontSize: 11, color: T.mute, marginTop: 12 }}>Session: {p.stripeSessionId}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
