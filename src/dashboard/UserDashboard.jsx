import { Link } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext.jsx";
import { C, THEME, font } from "./theme.js";

const T = THEME.dark;

export default function UserDashboard() {
  const userId = sessionStorage.getItem("dashboard_user_id");
  const { users, leads } = useDashboard();
  const user = users.find((u) => u.id === userId);
  const myLeads = leads.filter((l) => l.assignedToUserId === userId);

  if (!user) {
    return (
      <div style={{ maxWidth: 600, margin: "60px auto", textAlign: "center" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.mute} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16, opacity: 0.5 }}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
        <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute }}>User not found. <Link to="/dashboard/login" style={{ color: C.gold, fontWeight: 600 }}>Sign in again</Link>.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Welcome header */}
      <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.gold}30, ${C.goldLight}20)`,
          border: `2px solid ${C.gold}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: font.display, fontSize: 22, fontWeight: 600, color: C.gold,
        }}>
          {(user.name || user.email || "U")[0].toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontFamily: font.display, fontSize: "clamp(24px, 3vw, 30px)", color: T.text, marginBottom: 4 }}>
            Welcome, {user.name || "Realtor"}
          </h1>
          <p style={{ fontFamily: font.body, fontSize: 13, color: T.mute }}>Your profile and assigned leads</p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 32 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontFamily: font.body, fontSize: 11, color: T.mute, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Assigned Leads</div>
          <div style={{ fontFamily: font.display, fontSize: 28, color: C.gold, fontWeight: 600 }}>{myLeads.length}</div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontFamily: font.body, fontSize: 11, color: T.mute, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Plan</div>
          <div style={{ fontFamily: font.body, fontSize: 16, color: T.text, fontWeight: 600, textTransform: "capitalize" }}>{user.planId || "—"}</div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontFamily: font.body, fontSize: 11, color: T.mute, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Region</div>
          <div style={{ fontFamily: font.body, fontSize: 16, color: T.text, fontWeight: 600 }}>{user.region || "—"}</div>
        </div>
      </div>

      {/* Profile */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: font.body, fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          Profile
        </h2>
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: 24,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20, fontFamily: font.body, fontSize: 14 }}>
            {[
              { label: "Name", value: user.name },
              { label: "Email", value: user.email },
              { label: "Phone", value: user.phone },
              { label: "Brokerage", value: user.brokerage },
              user.region ? { label: "Region", value: user.region } : null,
            ].filter(Boolean).map((item) => (
              <div key={item.label}>
                <span style={{ color: T.mute, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</span>
                <div style={{ color: T.text, marginTop: 4, fontWeight: 500 }}>{item.value || "—"}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* My Leads */}
      <section>
        <h2 style={{ fontFamily: font.body, fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
          My Leads ({myLeads.length})
        </h2>
        {myLeads.length === 0 ? (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 40, textAlign: "center" }}>
            <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute }}>No leads assigned to you yet. Check back soon.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {myLeads.map((lead) => (
              <div
                key={lead.id}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: 20,
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.gold + "40")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 600, color: T.text }}>{lead.address || "—"}</div>
                  <span style={{
                    fontFamily: font.body, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5,
                    padding: "4px 10px", borderRadius: 6,
                    background: lead.status === "new" ? C.gold + "15" : C.surfaceLight,
                    color: lead.status === "new" ? C.gold : T.mute,
                    border: `1px solid ${lead.status === "new" ? C.gold + "30" : C.border}`,
                  }}>
                    {lead.status || "new"}
                  </span>
                </div>
                {lead.notes && <div style={{ fontFamily: font.body, fontSize: 13, color: T.mute, marginTop: 8, lineHeight: 1.5 }}>{lead.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
