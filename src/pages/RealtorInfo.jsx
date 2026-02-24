import { Link } from "react-router-dom";
import { C, font } from "../theme";

const sectionNum = { fontFamily: font.body, fontSize: 11, color: C.gold, letterSpacing: 0.15, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 };
const sectionTitle = { fontFamily: font.display, fontSize: 28, color: C.cream, marginBottom: 20, fontWeight: 600 };
const bodyText = { fontFamily: font.body, fontSize: 15, color: C.creamDim, lineHeight: 1.8 };
const cardStyle = { padding: "28px 24px", border: `1px solid ${C.border}`, background: C.surface, borderLeft: `3px solid ${C.gold}` };

export default function RealtorInfo() {
  const recordings = [
    { title: "ISA Verification Call / Seller Lead", type: "Seller" },
    { title: "ISA Verification Call / Seller Lead", type: "Seller" },
    { title: "ISA Verification Call / Seller Lead", type: "Seller" },
    { title: "ISA Verification Call / Seller Lead", type: "Seller" },
    { title: "ISA Verification Call / Seller Lead", type: "Seller" },
  ];

  const channels = [
    { title: "MLS Expireds & Old Listings", desc: "Properties that previously listed but did not sell, or listings that expired. Homeowners who have already shown intent to sell — we reach out, verify motivation and timeline, and pass only qualified seller leads." },
    { title: "Skip Tracing & Data", desc: "Professional skip-tracing and curated homeowner databases segmented by equity, tenure, and behavioral signals. We reach decision-makers with accuracy before any lead reaches you." },
    { title: "Geo-Targeting", desc: "Hyper-local focus calibrated to your exact ZIP codes and surrounding corridors. Every lead is exclusive to your territory." },
    { title: "Direct Outreach", desc: "Structured outreach campaigns against our curated databases. Every contact is verified for motivation and readiness before delivery." },
    { title: "Nurture & Follow-Up", desc: "Dedicated sequences that move prospects to qualification. Only those who meet our criteria are marked APPROVED and advanced to you." },
  ];

  return (
    <div style={{ background: C.void, minHeight: "100vh" }}>
      {/* Header / Brand */}
      <header style={{ padding: "48px 40px 32px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, border: `1px solid ${C.gold}`, transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ transform: "rotate(-45deg)", fontFamily: font.display, fontSize: 18, color: C.gold, fontWeight: 600 }}>E</span>
            </div>
            <div>
              <div style={{ fontFamily: font.display, fontSize: 18, color: C.cream, letterSpacing: 2 }}>ESTATE</div>
              <div style={{ fontFamily: font.body, fontSize: 9, color: C.gold, letterSpacing: 4, fontWeight: 600 }}>LAND</div>
            </div>
          </div>
          <div style={{ fontFamily: font.body, fontSize: 11, color: C.mute, letterSpacing: 0.1 }}>Premium Lead Generation for Real Estate Professionals</div>
        </div>
      </header>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "56px 40px 80px" }}>
        {/* Info about Estate Land */}
        <section style={{ marginBottom: 56, paddingBottom: 56, borderBottom: `1px solid ${C.border}` }}>
          <div style={sectionNum}>Info about Estate Land</div>
          <h2 style={sectionTitle}>Who we are</h2>
          <p style={{ ...bodyText, marginBottom: 16 }}>
            Estate Land is a premium lead generation and delivery platform built exclusively for real estate professionals across the United States. We serve agents, teams, and brokerages in 50+ markets with exclusive, verified seller leads — no shared lists, no unqualified inquiries.
          </p>
          <p style={{ ...bodyText, marginBottom: 16 }}>
            Our mission is simple: connect producing realtors with pre-qualified sellers who are ready to list. We handle sourcing, verification, and appointment setting so you can focus on closing. Every lead is exclusive to your territory and verified by our ISA team before it reaches you.
          </p>
          <p style={{ ...bodyText, margin: 0 }}>
            We offer flexible partnership plans (Launch, Growth, Premier) with transparent pricing, referral fees at closing, and live support. Whether you are a solo agent or a growing team, Estate Land is designed to scale with you.
          </p>
        </section>

        {/* Introduction */}
        <section style={{ marginBottom: 56 }}>
          <div style={sectionNum}>Introduction</div>
          <h1 style={{ fontFamily: font.display, fontSize: "clamp(32px, 4vw, 42px)", color: C.cream, lineHeight: 1.2, marginBottom: 24 }}>
            A Premium Lead Partner for the Discerning Real Estate Professional
          </h1>
          <p style={{ ...bodyText, marginBottom: 16 }}>
            We are writing to introduce you to a partnership that operates at an entirely different standard. At Estate Land, we do not sell raw contact lists or unqualified inquiries. We generate, verify, and deliver pre-qualified seller leads exclusively within your target territory, so that every conversation you enter is one worth having.
          </p>
          <p style={{ ...bodyText, margin: 0 }}>
            We operate as a dedicated lead intelligence partner: a full-service acquisition engine built specifically for real estate professionals who demand quality, precision, and results. Every lead that reaches you has been generated, contacted, verified, and approved before it ever touches your desk.
          </p>
        </section>

        {/* Section 01 - Our Lead Generation System */}
        <section style={{ marginBottom: 56 }}>
          <div style={sectionNum}>Section 01</div>
          <h2 style={sectionTitle}>Our Lead Generation System</h2>
          <p style={{ ...bodyText, marginBottom: 28 }}>
            Estate Land deploys multiple specialized approaches operating across distinct channels. This system ensures strong market coverage within your designated ZIP codes while maintaining the caliber of prospect that meets your standards.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {channels.map((ch, i) => (
              <div key={i} style={cardStyle}>
                <h3 style={{ fontFamily: font.display, fontSize: 18, color: C.gold, marginBottom: 10 }}>{ch.title}</h3>
                <p style={{ ...bodyText, margin: 0, fontSize: 14 }}>{ch.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ ...bodyText, marginTop: 20, marginBottom: 0 }}>
            Our systems are built around precision targeting, territory exclusivity, and verification at every stage so that every lead delivered is one you can act on with confidence.
          </p>
        </section>

        {/* Section 02 - Lead Verification & ISA Process */}
        <section style={{ marginBottom: 56 }}>
          <div style={sectionNum}>Section 02</div>
          <h2 style={sectionTitle}>Lead Verification & ISA Process</h2>
          <p style={{ ...bodyText, marginBottom: 20 }}>
            Every lead generated by our system is routed to our dedicated Inside Sales Agent (ISA) and Verification Team, not to you. Before any prospect is considered for delivery, our ISA team contacts them directly and conducts a structured qualification call.
          </p>
          <p style={{ ...bodyText, marginBottom: 16 }}>During each verification call, our team confirms:</p>
          <ul style={{ fontFamily: font.body, fontSize: 15, color: C.creamDim, lineHeight: 2, paddingLeft: 24, marginBottom: 20 }}>
            <li><strong style={{ color: C.cream }}>Full Legal Name</strong>, confirmed and recorded</li>
            <li><strong style={{ color: C.cream }}>Direct Phone Number</strong>, live-verified during the call</li>
            <li><strong style={{ color: C.cream }}>Email Address</strong>, confirmed for follow-up</li>
            <li><strong style={{ color: C.cream }}>Property Address</strong>, subject property confirmed for seller leads</li>
            <li><strong style={{ color: C.cream }}>Timeline</strong>, categorized as 0–30 days, 30–90 days, or long-term</li>
            <li><strong style={{ color: C.cream }}>Motivation Level</strong>, urgency and commitment gauged through structured dialogue</li>
          </ul>
          <p style={{ ...bodyText, margin: 0 }}>
            Only prospects who meet our full verification criteria are marked as <strong style={{ color: C.gold }}>APPROVED</strong> and advanced for delivery. All others are discarded or returned to our nurture pipeline. You receive only what has earned that designation.
          </p>
        </section>

        {/* Section 03 - Lead Delivery Process */}
        <section style={{ marginBottom: 56 }}>
          <div style={sectionNum}>Section 03</div>
          <h2 style={sectionTitle}>Lead Delivery Process</h2>
          <p style={{ ...bodyText, marginBottom: 20 }}>
            Once a lead receives APPROVED status, it is immediately assigned to the realtor holding exclusivity over that territory. You receive the complete prospect profile, formatted and ready for engagement, with no delay and no ambiguity about next steps.
          </p>
          <p style={{ ...bodyText, marginBottom: 16 }}>Every delivery arrives as a structured Lead Sheet. Sample Lead Sheet includes:</p>
          <ul style={{ fontFamily: font.body, fontSize: 15, color: C.creamDim, lineHeight: 2, paddingLeft: 24, margin: 0 }}>
            <li>Full Name</li>
            <li>Phone Number</li>
            <li>Email Address</li>
            <li>Property Address (Seller Leads)</li>
            <li>Timeline & Urgency Category</li>
            <li>Motivation Level</li>
            <li>ISA Verification Notes</li>
          </ul>
        </section>

        {/* Section 04 - Live Call Transfer */}
        <section style={{ marginBottom: 56 }}>
          <div style={{ ...sectionNum, display: "flex", alignItems: "center", gap: 8 }}>
            <span>Section 04</span>
            <span style={{ color: C.mute, fontWeight: 500 }}>|</span>
            <span style={{ color: C.gold }}>Premium Feature</span>
          </div>
          <h2 style={sectionTitle}>Live Call Transfer</h2>
          <p style={{ ...bodyText, marginBottom: 20 }}>
            For Growth and Premier partnership tiers, we offer Live Call Transfer — the highest-performance lead delivery method available. When our ISA confirms serious intent and immediate availability from a prospect, the following process is initiated in real time:
          </p>
          <ol style={{ fontFamily: font.body, fontSize: 15, color: C.creamDim, lineHeight: 2.2, paddingLeft: 24, marginBottom: 20 }}>
            <li>Our ISA confirms serious intent and immediate availability with the prospect.</li>
            <li>We notify you immediately via SMS and phone with a full lead brief.</li>
            <li>Once you confirm availability, the call is transferred live, connecting you directly with the prospect.</li>
            <li>You speak with a ready, pre-qualified prospect, reducing response latency to zero and dramatically increasing close probability.</li>
          </ol>
          <p style={{ ...bodyText, margin: 0 }}>
            Live transfer eliminates the single largest failure point in real estate lead conversion: delayed follow-up. When you speak to a prospect within seconds of their commitment, close rates increase substantially.
          </p>
        </section>

        {/* Section 05 - Call Scheduling Process */}
        <section style={{ marginBottom: 56 }}>
          <div style={sectionNum}>Section 05</div>
          <h2 style={sectionTitle}>Call Scheduling Process</h2>
          <p style={{ ...bodyText, marginBottom: 16 }}>
            We understand that a producing agent cannot always accept a live transfer at the moment it arises. For those occasions, our team initiates a structured scheduling process to ensure no qualified prospect is lost.
          </p>
          <p style={{ ...bodyText, margin: 0 }}>
            When you are unavailable, our ISA team works directly with the prospect to schedule a confirmed call based on your calendar availability. Both parties receive reminders leading up to the appointment. Every scheduled call arrives with the complete Lead Sheet already in your inbox, so you enter every conversation informed, positioned, and confident.
          </p>
        </section>

        {/* Section 06 - Performance Proof & Results */}
        <section style={{ marginBottom: 56 }}>
          <div style={sectionNum}>Section 06</div>
          <h2 style={sectionTitle}>Performance Proof & Results</h2>
          <p style={{ ...bodyText, marginBottom: 28 }}>
            We do not ask you to take our word for it. Below are samples of what we deliver: lead sheet format and real ISA verification call recordings from our team.
          </p>

          <div style={{ ...cardStyle, marginBottom: 28 }}>
            <h3 style={{ fontFamily: font.display, fontSize: 20, color: C.gold, marginBottom: 10 }}>Verified Lead Sheet Sample</h3>
            <p style={{ ...bodyText, marginBottom: 16 }}>A real sample of our structured lead sheet — exactly what you receive upon each approved lead delivery.</p>
            <Link to="/#contact" style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: C.gold, textDecoration: "none" }}>View Lead Sheet Sample →</Link>
          </div>

          <h3 style={{ fontFamily: font.display, fontSize: 20, color: C.cream, marginBottom: 20 }}>Live ISA Verification Call Recordings</h3>
          <p style={{ ...bodyText, marginBottom: 20 }}>The following are real calls conducted by our ISA team, qualifying and verifying prospects before delivery.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recordings.map((rec, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: "16px 20px", border: `1px solid ${C.border}`, background: C.surface }}>
                <div>
                  <div style={{ fontFamily: font.body, fontSize: 14, color: C.cream }}>Lead Call Recording {String(i + 1).padStart(2, "0")}</div>
                  <div style={{ fontFamily: font.body, fontSize: 12, color: C.mute, marginTop: 4 }}>{rec.title}</div>
                </div>
                <span style={{ fontFamily: font.body, fontSize: 12, fontWeight: 600, color: C.gold }}>Listen</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 07 - Our Lead Partnership Plans */}
        <section style={{ marginBottom: 56 }}>
          <div style={sectionNum}>Section 07</div>
          <h2 style={sectionTitle}>Our Lead Partnership Plans</h2>
          <p style={{ ...bodyText, marginBottom: 24 }}>
            We offer structured partnership tiers designed to align with your production goals and market coverage: Launch (6 months), Growth (per year), and Premier (lifetime). Each plan is built around exclusivity, volume, and the level of active support your business demands.
          </p>
          <Link to="/#pricing" style={{
            display: "inline-block", fontFamily: font.body, fontSize: 13, fontWeight: 600, letterSpacing: 0.08, textTransform: "uppercase",
            padding: "14px 28px", background: C.gold, color: C.void, borderRadius: 4, textDecoration: "none",
          }}>
            View Our Plans and Pricing
          </Link>
        </section>

        {/* Section 08 - Partnership Agreement */}
        <section style={{ marginBottom: 56 }}>
          <div style={sectionNum}>Section 08</div>
          <h2 style={sectionTitle}>Partnership Agreement</h2>
          <p style={{ ...bodyText, marginBottom: 20 }}>
            To formalize our partnership and begin lead delivery within your territory, a signed agreement is required. Our standard partnership agreement is straightforward, fair, and designed to protect both parties. It outlines delivery expectations, exclusivity terms, and the obligations of each side.
          </p>
          <div style={cardStyle}>
            <h3 style={{ fontFamily: font.display, fontSize: 18, color: C.gold, marginBottom: 12 }}>Estate Land Partnership Agreement</h3>
            <p style={{ ...bodyText, marginBottom: 16 }}>
              Please review the full agreement and return a signed copy to hello@estateland.us to begin onboarding.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link to="/#contact" style={{ fontFamily: font.body, fontSize: 12, fontWeight: 600, color: C.gold, textDecoration: "none" }}>Review Agreement</Link>
              <span style={{ color: C.mute }}>|</span>
              <a href="mailto:hello@estateland.us" style={{ fontFamily: font.body, fontSize: 12, fontWeight: 600, color: C.gold, textDecoration: "none" }}>Email Signed Copy</a>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section style={{ marginBottom: 48, paddingTop: 32, borderTop: `1px solid ${C.border}` }}>
          <blockquote style={{ fontFamily: font.display, fontSize: 22, color: C.creamDim, fontStyle: "italic", lineHeight: 1.6, margin: "0 0 32px", borderLeft: `3px solid ${C.gold}`, paddingLeft: 24 }}>
            "The agents who win in competitive markets are those who speak to the right prospects first. We exist to ensure you are always that agent."
          </blockquote>
          <p style={{ ...bodyText, marginBottom: 24 }}>
            The Estate Land Partnership Team
          </p>
          <p style={{ ...bodyText, marginBottom: 28 }}>
            We welcome the opportunity to discuss how an Estate Land partnership can elevate your production. Please reach out to schedule a no-obligation strategy call, or visit our website to review our full service offering. We look forward to building something exceptional together.
          </p>
          <p style={{ fontFamily: font.body, fontSize: 14, color: C.mute, marginBottom: 8 }}>Warm regards,</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, border: `1px solid ${C.gold}`, transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ transform: "rotate(-45deg)", fontFamily: font.display, fontSize: 14, color: C.gold, fontWeight: 600 }}>E</span>
            </div>
            <span style={{ fontFamily: font.display, fontSize: 18, color: C.cream }}>Estate Land</span>
          </div>
          <div style={{ fontFamily: font.body, fontSize: 14, color: C.creamDim }}>
            <a href="tel:+18005551234" style={{ color: C.gold, textDecoration: "none" }}>+1 (800) XXX-XXXX</a>
            <span style={{ color: C.mute, margin: "0 12px" }}>·</span>
            <a href="mailto:hello@estateland.us" style={{ color: C.gold, textDecoration: "none" }}>hello@estateland.us</a>
          </div>
          <div style={{ fontFamily: font.body, fontSize: 12, color: C.mute, marginTop: 8 }}>www.estateland.us</div>
        </section>

        {/* CTA strip */}
        <section style={{ padding: "40px 32px", border: `1px solid ${C.gold}`, background: C.surface, textAlign: "center" }}>
          <p style={{ fontFamily: font.body, fontSize: 11, color: C.gold, letterSpacing: 0.15, textTransform: "uppercase", marginBottom: 8 }}>Premium Lead Generation for Real Estate Professionals</p>
          <p style={{ fontFamily: font.body, fontSize: 13, color: C.mute, marginBottom: 24 }}>
            estateland.us · hello@estateland.us · +1 (800) XXX-XXXX
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <Link to="/#pricing" style={{ fontFamily: font.body, fontSize: 12, fontWeight: 600, padding: "12px 24px", background: C.gold, color: C.void, borderRadius: 4, textDecoration: "none" }}>View Pricing and Plans</Link>
            <Link to="/#contact" style={{ fontFamily: font.body, fontSize: 12, fontWeight: 600, padding: "12px 24px", background: "transparent", color: C.cream, border: `1px solid ${C.border}`, borderRadius: 4, textDecoration: "none" }}>Schedule a Strategy Call</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
