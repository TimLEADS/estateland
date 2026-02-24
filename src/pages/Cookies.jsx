import { Link } from "react-router-dom";
import { C, font } from "../theme";

export default function Cookies() {
  const section = (title, children) => (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: font.display, fontSize: 22, color: C.gold, marginBottom: 12 }}>{title}</h2>
      <div style={{ fontFamily: font.body, fontSize: 15, color: C.creamDim, lineHeight: 1.8 }}>{children}</div>
    </div>
  );

  return (
    <section style={{ padding: "120px 40px", maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontFamily: font.display, fontSize: "clamp(32px, 4vw, 44px)", color: C.cream, marginBottom: 24 }}>
        Cookie <span style={{ color: C.gold }}>Policy</span>
      </h1>
      <p style={{ fontFamily: font.body, fontSize: 14, color: C.mute, marginBottom: 48 }}>Last updated: February 2026</p>

      {section("What Are Cookies", <p>Cookies are small text files stored on your device when you visit our website. They help us provide a better experience.</p>)}
      {section("How We Use Cookies", <p>We use cookies for essential site functionality, authentication, analytics, and to remember your preferences. We do not use cookies for advertising.</p>)}
      {section("Your Choices", <p>You can disable cookies in your browser settings, but some features may not work correctly. Most browsers allow you to manage cookie preferences.</p>)}
      {section("Contact", <p>Questions? Email <a href="mailto:hello@estateland.us" style={{ color: C.gold, textDecoration: "none" }}>hello@estateland.us</a>.</p>)}

      <Link to="/" style={{ fontFamily: font.body, fontSize: 14, color: C.gold, textDecoration: "none" }}>← Back to home</Link>
    </section>
  );
}
