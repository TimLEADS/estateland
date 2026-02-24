import { useState } from "react";
import { useDashboard } from "../context/DashboardContext.jsx";
import { C, THEME, font } from "./theme.js";

const T = THEME.dark;

export default function Leads() {
  const { leads, users, addLead, removeLead } = useDashboard();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ address: "", notes: "", assignedToUserId: "" });

  const handleCreate = (e) => {
    e.preventDefault();
    addLead({
      address: form.address,
      notes: form.notes,
      assignedToUserId: form.assignedToUserId || null,
      status: "new",
    });
    setForm({ address: "", notes: "", assignedToUserId: "" });
    setShowForm(false);
  };

  const getUserName = (userId) => users.find((u) => u.id === userId)?.name || users.find((u) => u.id === userId)?.email || userId || "Unassigned";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: font.display, fontSize: 28, color: T.text, marginBottom: 8 }}>Leads</h1>
          <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute }}>Create leads and assign them to realtors.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          style={{
            fontFamily: font.body, fontSize: 13, fontWeight: 600, color: C.void, background: C.gold,
            border: "none", padding: "12px 24px", borderRadius: 10, cursor: "pointer",
          }}
        >
          + Create lead
        </button>
      </div>

      {showForm && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 32 }}>
          <h2 style={{ fontFamily: font.body, fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 20 }}>New lead</h2>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
            <label>
              <span style={{ fontFamily: font.body, fontSize: 12, fontWeight: 600, color: T.mute, display: "block", marginBottom: 6 }}>Address / property</span>
              <input
                type="text"
                placeholder="e.g. 123 Main St, City, State"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                required
                style={{
                  width: "100%", padding: "12px 16px", fontFamily: font.body, fontSize: 14, color: T.text,
                  background: C.surfaceLight, border: `1px solid ${C.border}`, borderRadius: 8,
                }}
              />
            </label>
            <label>
              <span style={{ fontFamily: font.body, fontSize: 12, fontWeight: 600, color: T.mute, display: "block", marginBottom: 6 }}>Notes</span>
              <textarea
                placeholder="Optional notes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
                style={{
                  width: "100%", padding: "12px 16px", fontFamily: font.body, fontSize: 14, color: T.text,
                  background: C.surfaceLight, border: `1px solid ${C.border}`, borderRadius: 8, resize: "vertical",
                }}
              />
            </label>
            <label>
              <span style={{ fontFamily: font.body, fontSize: 12, fontWeight: 600, color: T.mute, display: "block", marginBottom: 6 }}>Assign to realtor</span>
              <select
                value={form.assignedToUserId}
                onChange={(e) => setForm((f) => ({ ...f, assignedToUserId: e.target.value }))}
                style={{
                  width: "100%", padding: "12px 16px", fontFamily: font.body, fontSize: 14, color: T.text,
                  background: C.surfaceLight, border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer",
                }}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name || u.email}</option>
                ))}
              </select>
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: C.void, background: C.gold, border: "none", padding: "12px 24px", borderRadius: 8, cursor: "pointer" }}>Create lead</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ fontFamily: font.body, fontSize: 13, color: T.mute, background: "transparent", border: `1px solid ${C.border}`, padding: "12px 24px", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {leads.length === 0 ? (
          <p style={{ fontFamily: font.body, fontSize: 14, color: T.mute }}>No leads yet. Create one and assign to a user.</p>
        ) : (
          leads.slice().reverse().map((lead) => (
            <div
              key={lead.id}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 600, color: T.text }}>{lead.address || "—"}</div>
                {lead.notes && <div style={{ fontFamily: font.body, fontSize: 13, color: T.mute, marginTop: 4 }}>{lead.notes}</div>}
                <div style={{ fontFamily: font.body, fontSize: 12, color: T.mute, marginTop: 6 }}>Assigned to: {getUserName(lead.assignedToUserId)} · {lead.status || "new"}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: font.body, fontSize: 11, color: C.mute }}>{new Date(lead.createdAt).toLocaleDateString()}</span>
                <button
                  type="button"
                  onClick={() => window.confirm("Remove this lead?") && removeLead(lead.id)}
                  style={{
                    fontFamily: font.body, fontSize: 12, color: "#e57373", background: "transparent",
                    border: "1px solid rgba(229,115,115,0.5)", padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                  }}
                  title="Remove lead"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
