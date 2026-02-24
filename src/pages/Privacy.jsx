import { Link } from "react-router-dom";
import { C, font } from "../theme";

export default function Privacy() {
  const section = (title, children) => (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: font.display, fontSize: 22, color: C.gold, marginBottom: 12 }}>{title}</h2>
      <div style={{ fontFamily: font.body, fontSize: 15, color: C.creamDim, lineHeight: 1.8 }}>{children}</div>
    </div>
  );

  return (
    <section style={{ padding: "120px 40px", maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontFamily: font.display, fontSize: "clamp(32px, 4vw, 44px)", color: C.cream, marginBottom: 24 }}>
        Privacy <span style={{ color: C.gold }}>Policy</span>
      </h1>
      <p style={{ fontFamily: font.body, fontSize: 14, color: C.mute, marginBottom: 48 }}>Last updated: February 2026</p>

      {section("Information We Collect", <p>We collect information you provide when signing up, including name, email, phone number, brokerage, and market preferences. We also collect usage data to improve our service.</p>)}
      {section("How We Use Your Information", <p>Your information is used to deliver leads, configure your CRM, provide customer support, and communicate about your account. We do not sell your personal information to third parties.</p>)}
      {section("Data Security", <p>We use industry-standard encryption and security practices to protect your data. Access to personal information is restricted to authorized personnel.</p>)}
      {section("Your Rights", <p>You may request access, correction, or deletion of your personal data. Contact us at <a href="mailto:privacy@estateland.us" style={{ color: C.gold, textDecoration: "none" }}>privacy@estateland.us</a>.</p>)}
      {section("Contact", <p>Questions? Email <a href="mailto:support@estateland.us" style={{ color: C.gold, textDecoration: "none" }}>support@estateland.us</a>.</p>)}

      <Link to="/" style={{ fontFamily: font.body, fontSize: 14, color: C.gold, textDecoration: "none" }}>← Back to home</Link>
    </section>
  );
}
