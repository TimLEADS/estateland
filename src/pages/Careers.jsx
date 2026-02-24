import { Link } from "react-router-dom";
import { C, font } from "../theme";

export default function Careers() {
  return (
    <section style={{ padding: "120px 40px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 48, height: 1, background: C.gold }} />
          <span style={{ fontFamily: font.body, fontSize: 10, color: C.gold, letterSpacing: 0.15, textTransform: "uppercase", fontWeight: 600 }}>Join Us</span>
        </div>
        <h1 style={{ fontFamily: font.display, fontSize: "clamp(34px, 4vw, 48px)", color: C.cream, lineHeight: 1.1, marginBottom: 24 }}>
          Careers at <span style={{ color: C.gold }}>Estate Land</span>
        </h1>
        <p style={{ fontFamily: font.body, fontSize: 17, color: C.creamDim, lineHeight: 1.75 }}>
          We're building the future of real estate lead generation. If you're driven, talented, and want to help realtors win in their markets, we'd love to hear from you.
        </p>
      </div>

      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontFamily: font.display, fontSize: 24, color: C.gold, marginBottom: 16 }}>Open Positions</h2>
        <p style={{ fontFamily: font.body, fontSize: 15, color: C.mute, lineHeight: 1.7, marginBottom: 32 }}>
          We're currently growing our team. Check back soon for open roles in sales, marketing, and operations — or send your resume to{" "}
          <a href="mailto:careers@estateland.us" style={{ color: C.gold, textDecoration: "none" }}>careers@estateland.us</a>.
        </p>
        <div style={{ background: C.surface, padding: 32, border: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: font.body, fontSize: 14, color: C.mute }}>No open positions at the moment. We'll post new roles here as they become available.</div>
        </div>
      </div>

      <div>
        <h2 style={{ fontFamily: font.display, fontSize: 24, color: C.gold, marginBottom: 16 }}>Why Estate Land?</h2>
        <ul style={{ fontFamily: font.body, fontSize: 15, color: C.creamDim, lineHeight: 1.9, paddingLeft: 24 }}>
          <li>Work with a team that understands real estate</li>
          <li>Remote-first culture across all 50 states</li>
          <li>Competitive compensation and growth opportunities</li>
        </ul>
      </div>

      <Link to="/#contact" className="gold-btn" style={{ display: "inline-flex", marginTop: 48, textDecoration: "none" }}>
        Get In Touch
      </Link>
    </section>
  );
}
