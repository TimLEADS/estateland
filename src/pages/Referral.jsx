import { Link } from "react-router-dom";
import { C, font } from "../theme";

export default function Referral() {
  return (
    <section style={{ padding: "120px 40px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 48, height: 1, background: C.gold }} />
          <span style={{ fontFamily: font.body, fontSize: 10, color: C.gold, letterSpacing: 0.15, textTransform: "uppercase", fontWeight: 600 }}>Partners</span>
        </div>
        <h1 style={{ fontFamily: font.display, fontSize: "clamp(34px, 4vw, 48px)", color: C.cream, lineHeight: 1.1, marginBottom: 24 }}>
          Referral <span style={{ color: C.gold }}>Program</span>
        </h1>
        <p style={{ fontFamily: font.body, fontSize: 17, color: C.creamDim, lineHeight: 1.75 }}>
          Earn rewards for every agent you refer to Estate Land. Our agents love the platform — and so will yours.
        </p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: font.display, fontSize: 22, color: C.gold, marginBottom: 16 }}>How It Works</h2>
        <ul style={{ fontFamily: font.body, fontSize: 15, color: C.creamDim, lineHeight: 1.9, paddingLeft: 24 }}>
          <li>Refer another realtor to Estate Land</li>
          <li>They sign up and receive their first leads</li>
          <li>You earn a referral bonus for every qualified sign-up</li>
        </ul>
      </div>

      <div style={{ background: C.surface, padding: 32, border: `1px solid ${C.gold}` }}>
        <p style={{ fontFamily: font.body, fontSize: 15, color: C.creamDim, lineHeight: 1.75 }}>
          Interested in the referral program? Contact us at{" "}
          <a href="mailto:referrals@estateland.us" style={{ color: C.gold, textDecoration: "none" }}>referrals@estateland.us</a> for details and your unique referral link.
        </p>
      </div>

      <Link to="/#contact" className="gold-btn" style={{ display: "inline-flex", marginTop: 40, textDecoration: "none" }}>
        Get Your Referral Link
      </Link>
    </section>
  );
}
