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
      <div>
        <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute }}>User not found. <Link to="/dashboard/login" style={{ color: C.gold }}>Sign in again</Link>.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontFamily: font.display, fontSize: 28, color: T.text, marginBottom: 8 }}>My dashboard</h1>
      <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute, marginBottom: 32 }}>Your profile and assigned leads.</p>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 16 }}>Profile</h2>
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 24,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, fontFamily: font.body, fontSize: 14 }}>
            <div><span style={{ color: T.mute }}>Name</span><br /><span style={{ color: T.text }}>{user.name || "—"}</span></div>
            <div><span style={{ color: T.mute }}>Email</span><br /><span style={{ color: T.text }}>{user.email || "—"}</span></div>
            <div><span style={{ color: T.mute }}>Phone</span><br /><span style={{ color: T.text }}>{user.phone || "—"}</span></div>
            <div><span style={{ color: T.mute }}>Brokerage</span><br /><span style={{ color: T.text }}>{user.brokerage || "—"}</span></div>
            {user.region && <div><span style={{ color: T.mute }}>Region</span><br /><span style={{ color: T.text }}>{user.region}</span></div>}
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 16 }}>My leads</h2>
        {myLeads.length === 0 ? (
          <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute }}>No leads assigned to you yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {myLeads.map((lead) => (
              <div
                key={lead.id}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 600, color: T.text }}>{lead.address || "—"}</div>
                {lead.notes && <div style={{ fontFamily: font.body, fontSize: 13, color: T.mute, marginTop: 6 }}>{lead.notes}</div>}
                <div style={{ fontFamily: font.body, fontSize: 12, color: T.mute, marginTop: 8 }}>Status: {lead.status || "new"}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
