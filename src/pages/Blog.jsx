import { Link } from "react-router-dom";
import { C, font } from "../theme";

const posts = [
  { title: "How to Qualify Seller Leads Faster", excerpt: "Five steps to identify motivated sellers before your competitors.", slug: "qualify-seller-leads" },
  { title: "Building a Real Estate Farm Area Strategy", excerpt: "A practical guide to dominating your target ZIP codes.", slug: "farm-area-strategy" },
  { title: "Why Exclusive Leads Beat Shared Portals", excerpt: "The math behind owning your lead pipeline.", slug: "exclusive-vs-shared" },
];

export default function Blog() {
  return (
    <section style={{ padding: "120px 40px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 48, height: 1, background: C.gold }} />
          <span style={{ fontFamily: font.body, fontSize: 10, color: C.gold, letterSpacing: 0.15, textTransform: "uppercase", fontWeight: 600 }}>Resources</span>
        </div>
        <h1 style={{ fontFamily: font.display, fontSize: "clamp(34px, 4vw, 48px)", color: C.cream, lineHeight: 1.1, marginBottom: 24 }}>
          The Estate Land <span style={{ color: C.gold }}>Blog</span>
        </h1>
        <p style={{ fontFamily: font.body, fontSize: 17, color: C.creamDim, lineHeight: 1.75 }}>
          Insights for realtors on lead generation, listing strategies, and market trends.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {posts.map((p) => (
          <article key={p.slug} style={{ background: C.surface, padding: 32, border: `1px solid ${C.border}` }}>
            <h2 style={{ fontFamily: font.display, fontSize: 22, color: C.cream, marginBottom: 12 }}>{p.title}</h2>
            <p style={{ fontFamily: font.body, fontSize: 15, color: C.mute, lineHeight: 1.7 }}>{p.excerpt}</p>
            <span style={{ fontFamily: font.body, fontSize: 12, color: C.gold, marginTop: 12, display: "inline-block" }}>Coming soon</span>
          </article>
        ))}
      </div>

      <Link to="/contact" className="gold-btn" style={{ display: "inline-flex", marginTop: 48, textDecoration: "none" }}>
        Get Exclusive Leads
      </Link>
    </section>
  );
}
