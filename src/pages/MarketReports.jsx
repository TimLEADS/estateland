import { Link } from "react-router-dom";
import { C, font } from "../theme";

export default function MarketReports() {
  return (
    <section style={{ padding: "120px 40px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 48, height: 1, background: C.gold }} />
          <span style={{ fontFamily: font.body, fontSize: 10, color: C.gold, letterSpacing: 0.15, textTransform: "uppercase", fontWeight: 600 }}>Resources</span>
        </div>
        <h1 style={{ fontFamily: font.display, fontSize: "clamp(34px, 4vw, 48px)", color: C.cream, lineHeight: 1.1, marginBottom: 24 }}>
          Market <span style={{ color: C.gold }}>Reports</span>
        </h1>
        <p style={{ fontFamily: font.body, fontSize: 17, color: C.creamDim, lineHeight: 1.75 }}>
          Data-driven insights on seller activity, inventory trends, and lead performance across US markets.
        </p>
      </div>

      <div style={{ background: C.surface, padding: 40, border: `1px solid ${C.border}`, marginBottom: 32 }}>
        <p style={{ fontFamily: font.body, fontSize: 15, color: C.creamDim, lineHeight: 1.75 }}>
          Estate Land agents receive monthly market reports for their territory, including seller intent signals, days on market trends, and conversion benchmarks. Full market reports are available to active subscribers.
        </p>
      </div>

      <Link to="/#contact" className="gold-btn" style={{ display: "inline-flex", textDecoration: "none" }}>
        Request Access
      </Link>
    </section>
  );
}
