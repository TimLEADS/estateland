import { Link } from "react-router-dom";
import { C, font } from "../theme";

export default function Terms() {
  const section = (title, children) => (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: font.display, fontSize: 22, color: C.gold, marginBottom: 12 }}>{title}</h2>
      <div style={{ fontFamily: font.body, fontSize: 15, color: C.creamDim, lineHeight: 1.8 }}>{children}</div>
    </div>
  );

  return (
    <section style={{ padding: "120px 40px", maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontFamily: font.display, fontSize: "clamp(32px, 4vw, 44px)", color: C.cream, marginBottom: 24 }}>
        Terms of <span style={{ color: C.gold }}>Service</span>
      </h1>
      <p style={{ fontFamily: font.body, fontSize: 14, color: C.mute, marginBottom: 48 }}>Last updated: February 2026</p>

      {section("Agreement", <p>By using Estate Land, you agree to these terms. If you do not agree, do not use our services.</p>)}
      {section("Services", <p>Estate Land provides exclusive seller leads and related services to licensed real estate professionals in the United States. Services are provided on a month-to-month basis unless otherwise agreed.</p>)}
      {section("User Responsibilities", <p>You must provide accurate information, maintain your real estate license in good standing, and use leads in compliance with applicable laws and regulations.</p>)}
      {section("Termination", <p>You may cancel at any time. We may suspend or terminate accounts for violation of these terms or non-payment.</p>)}
      {section("Contact", <p>Questions? Email <a href="mailto:hello@estateland.us" style={{ color: C.gold, textDecoration: "none" }}>hello@estateland.us</a>.</p>)}

      <Link to="/" style={{ fontFamily: font.body, fontSize: 14, color: C.gold, textDecoration: "none" }}>← Back to home</Link>
    </section>
  );
}
