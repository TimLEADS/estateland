import { Link } from "react-router-dom";
import { C, font } from "../theme";

export default function AgentGuide() {
  return (
    <section style={{ padding: "120px 40px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 48, height: 1, background: C.gold }} />
          <span style={{ fontFamily: font.body, fontSize: 10, color: C.gold, letterSpacing: 0.15, textTransform: "uppercase", fontWeight: 600 }}>Resources</span>
        </div>
        <h1 style={{ fontFamily: font.display, fontSize: "clamp(34px, 4vw, 48px)", color: C.cream, lineHeight: 1.1, marginBottom: 24 }}>
          Agent <span style={{ color: C.gold }}>Guide</span>
        </h1>
        <p style={{ fontFamily: font.body, fontSize: 17, color: C.creamDim, lineHeight: 1.75 }}>
          Everything you need to maximize your Estate Land leads and close more listings.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <div>
          <h2 style={{ fontFamily: font.display, fontSize: 22, color: C.gold, marginBottom: 12 }}>Getting Started</h2>
          <p style={{ fontFamily: font.body, fontSize: 15, color: C.creamDim, lineHeight: 1.75 }}>
            Once you onboard, our team configures your CRM, sets up your territory, and builds your first campaigns. Most agents receive their first leads within 7–14 days.
          </p>
        </div>
        <div>
          <h2 style={{ fontFamily: font.display, fontSize: 22, color: C.gold, marginBottom: 12 }}>Best Practices</h2>
          <ul style={{ fontFamily: font.body, fontSize: 15, color: C.creamDim, lineHeight: 1.9, paddingLeft: 24 }}>
            <li>Follow up within 5 minutes of lead delivery</li>
            <li>Use our appointment-setting service to save time</li>
            <li>Review your territory performance monthly</li>
          </ul>
        </div>
      </div>

      <Link to="/#contact" className="gold-btn" style={{ display: "inline-flex", marginTop: 48, textDecoration: "none" }}>
        Schedule a Strategy Call
      </Link>
    </section>
  );
}
