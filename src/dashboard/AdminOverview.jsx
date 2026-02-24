import { Link } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext.jsx";
import { C, THEME, font } from "./theme.js";

const T = THEME.dark;

export default function AdminOverview() {
  const { users, leads, payments, chatSessions, inProgressSessions, submittedSessions } = useDashboard();

  const cards = [
    { label: "Realtors", value: users.length, to: "/dashboard/users", color: C.gold },
    { label: "All Relators (sheet)", value: users.length, to: "/dashboard/relators", color: C.goldLight },
    { label: "Leads", value: leads.length, to: "/dashboard/leads", color: C.goldLight },
    { label: "Payments (successful)", value: (payments || []).length, to: "/dashboard/payments", color: "#22c55e" },
    { label: "Onboarding in progress", value: inProgressSessions.length, to: "/dashboard/live", color: C.cream },
    { label: "Submissions (total)", value: submittedSessions.length, to: "/dashboard/live", color: C.mute },
    { label: "Chat sessions", value: (chatSessions || []).length, to: "/dashboard/chat", color: C.cream },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: font.display, fontSize: 28, color: T.text, marginBottom: 8 }}>Overview</h1>
      <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute, marginBottom: 32 }}>Dashboard summary. Realtors come from onboarding; leads are created and assigned by you.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 24,
              textDecoration: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.gold;
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontFamily: font.body, fontSize: 13, color: T.mute, marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontFamily: font.display, fontSize: 36, color: c.color, fontWeight: 600 }}>{c.value}</div>
          </Link>
        ))}
      </div>
      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 16 }}>Quick actions</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/dashboard/live" style={{ fontFamily: font.body, fontSize: 13, color: C.gold, textDecoration: "none" }}>View live onboarding →</Link>
          <Link to="/dashboard/payments" style={{ fontFamily: font.body, fontSize: 13, color: C.gold, textDecoration: "none" }}>Payments →</Link>
          <Link to="/dashboard/users" style={{ fontFamily: font.body, fontSize: 13, color: C.gold, textDecoration: "none" }}>Manage users →</Link>
          <Link to="/dashboard/relators" style={{ fontFamily: font.body, fontSize: 13, color: C.gold, textDecoration: "none" }}>All Relators sheet →</Link>
          <Link to="/dashboard/leads" style={{ fontFamily: font.body, fontSize: 13, color: C.gold, textDecoration: "none" }}>Create lead →</Link>
          <Link to="/dashboard/chat" style={{ fontFamily: font.body, fontSize: 13, color: C.gold, textDecoration: "none" }}>Chat →</Link>
        </div>
      </div>
    </div>
  );
}
